// features/orders/server/mutations.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/prisma-adapter/client', () => ({
  default: {
    order: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import prisma from '@/features/prisma-adapter/client';
import { logger } from '@/lib/logger';
import { createOrderDB, cancelOrderDB } from './mutations';
import { orderInclude } from './constants';

const order = prisma.order as any;

const orderInput = {
  total: 2_000_000,
  items: [
    { productId: 'p1', quantity: 2, price: 500_000 },
    { productId: 'p2', quantity: 1, price: 1_000_000 },
  ],
  address: {
    fullName: 'علی رضایی',
    phone: '09123456789',
    city: 'تهران',
    postalCode: '1234567890',
    address: 'تهران، خیابان ولیعصر، پلاک 10',
  },
} as any;

describe('orders/server/mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrderDB', () => {
    it('should create order with nested items and address', async () => {
      order.create.mockResolvedValue({ id: 'o1' });

      await createOrderDB('user-1', orderInput);

      expect(order.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          total: 2_000_000,
          items: { create: orderInput.items },
          address: { create: orderInput.address },
        },
      });
    });

    it('should return the created order', async () => {
      const created = { id: 'o1', userId: 'user-1' };
      order.create.mockResolvedValue(created);

      expect(await createOrderDB('user-1', orderInput)).toEqual(created);
    });

    it('should log success with order info', async () => {
      order.create.mockResolvedValue({ id: 'o1' });

      await createOrderDB('user-1', orderInput);

      expect(logger.info).toHaveBeenCalledWith(
        'createOrderDB success',
        expect.objectContaining({
          orderId: 'o1',
          userId: 'user-1',
          total: 2_000_000,
          itemCount: 2,
          duration: expect.any(Number),
        })
      );
    });

    it('should log and rethrow when prisma fails', async () => {
      const error = new Error('DB down');
      order.create.mockRejectedValue(error);

      await expect(createOrderDB('user-1', orderInput)).rejects.toThrow('DB down');

      expect(logger.error).toHaveBeenCalledWith(
        'createOrderDB failed',
        expect.objectContaining({ userId: 'user-1', error: 'DB down', itemCount: 2 })
      );
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should log "Unknown" when a non-Error is thrown', async () => {
      order.create.mockRejectedValue('boom');

      await expect(createOrderDB('user-1', orderInput)).rejects.toBe('boom');

      expect(logger.error).toHaveBeenCalledWith(
        'createOrderDB failed',
        expect.objectContaining({ error: 'Unknown' })
      );
    });
  });

  describe('cancelOrderDB', () => {
    it('should look up the order scoped to the user', async () => {
      order.findFirst.mockResolvedValue(null);

      await cancelOrderDB('o1', 'user-1');

      expect(order.findFirst).toHaveBeenCalledWith({ where: { id: 'o1', userId: 'user-1' } });
    });

    it('should return NOT_FOUND when order does not exist or belongs to another user', async () => {
      order.findFirst.mockResolvedValue(null);

      const result = await cancelOrderDB('o1', 'user-1');

      expect(result).toEqual({ success: false, reason: 'NOT_FOUND' });
      expect(order.update).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        'cancelOrderDB: order not found or not owned by user',
        { orderId: 'o1', userId: 'user-1' }
      );
    });

    it.each(['PAID', 'SHIPPED', 'DELIVERED', 'CANCELED'])(
      'should return NOT_CANCELABLE when status is %s',
      async status => {
        order.findFirst.mockResolvedValue({ id: 'o1', status });

        const result = await cancelOrderDB('o1', 'user-1');

        expect(result).toEqual({ success: false, reason: 'NOT_CANCELABLE' });
        expect(order.update).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalledWith(
          'cancelOrderDB: order not cancelable',
          expect.objectContaining({ status })
        );
      }
    );

    it('should cancel a PENDING order and return the updated order', async () => {
      const updated = { id: 'o1', status: 'CANCELED' };
      order.findFirst.mockResolvedValue({ id: 'o1', status: 'PENDING' });
      order.update.mockResolvedValue(updated);

      const result = await cancelOrderDB('o1', 'user-1');

      expect(order.update).toHaveBeenCalledWith({
        where: { id: 'o1' },
        data: { status: 'CANCELED' },
        include: orderInclude,
      });
      expect(result).toEqual({ success: true, order: updated });
      expect(logger.info).toHaveBeenCalledWith(
        'cancelOrderDB success',
        expect.objectContaining({ orderId: 'o1', userId: 'user-1' })
      );
    });

    it('should log and rethrow when findFirst fails', async () => {
      order.findFirst.mockRejectedValue(new Error('find failed'));

      await expect(cancelOrderDB('o1', 'user-1')).rejects.toThrow('find failed');

      expect(logger.error).toHaveBeenCalledWith(
        'cancelOrderDB failed',
        expect.objectContaining({ error: 'find failed' })
      );
    });

    it('should log and rethrow when update fails', async () => {
      order.findFirst.mockResolvedValue({ id: 'o1', status: 'PENDING' });
      order.update.mockRejectedValue(new Error('update failed'));

      await expect(cancelOrderDB('o1', 'user-1')).rejects.toThrow('update failed');

      expect(logger.error).toHaveBeenCalledWith(
        'cancelOrderDB failed',
        expect.objectContaining({ error: 'update failed' })
      );
    });
  });
});
