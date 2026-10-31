// features/orders/server/queries.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/prisma-adapter/client', () => ({
  default: {
    order: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
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
import {
  getOrderByIdDB,
  getUserOrdersDB,
  getAdminOrdersDB,
  getAdminOrderByIdDB,
  updateOrderStatusDB,
} from './queries';
import { orderInclude, adminOrderInclude } from './constants';

const order = prisma.order as any;

describe('orders/server/queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrderByIdDB', () => {
    it('should query by id AND userId with orderInclude', async () => {
      order.findFirst.mockResolvedValue({ id: 'o1' });

      await getOrderByIdDB('o1', 'user-1');

      expect(order.findFirst).toHaveBeenCalledWith({
        where: { id: 'o1', userId: 'user-1' },
        include: orderInclude,
      });
    });

    it('should return the order when found', async () => {
      const found = { id: 'o1' };
      order.findFirst.mockResolvedValue(found);

      expect(await getOrderByIdDB('o1', 'user-1')).toEqual(found);
      expect(logger.info).toHaveBeenCalledWith(
        'getOrderByIdDB success',
        expect.objectContaining({ orderId: 'o1', userId: 'user-1' })
      );
    });

    it('should return null when not found', async () => {
      order.findFirst.mockResolvedValue(null);

      expect(await getOrderByIdDB('o1', 'user-1')).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'getOrderByIdDB: order not found',
        expect.objectContaining({ orderId: 'o1' })
      );
    });

    it('should log and rethrow on error', async () => {
      order.findFirst.mockRejectedValue(new Error('DB error'));

      await expect(getOrderByIdDB('o1', 'user-1')).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalledWith(
        'getOrderByIdDB failed',
        expect.objectContaining({ error: 'DB error' })
      );
    });
  });

  describe('getUserOrdersDB', () => {
    it('should fetch only the user orders, newest first', async () => {
      order.findMany.mockResolvedValue([]);

      await getUserOrdersDB('user-1');

      expect(order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        include: orderInclude,
      });
    });

    it('should return orders and log count', async () => {
      const orders = [{ id: 'o1' }, { id: 'o2' }];
      order.findMany.mockResolvedValue(orders);

      expect(await getUserOrdersDB('user-1')).toEqual(orders);
      expect(logger.info).toHaveBeenCalledWith(
        'getUserOrdersDB success',
        expect.objectContaining({ userId: 'user-1', count: 2 })
      );
    });

    it('should return empty array when user has no orders', async () => {
      order.findMany.mockResolvedValue([]);

      expect(await getUserOrdersDB('user-1')).toEqual([]);
    });

    it('should log and rethrow on error', async () => {
      order.findMany.mockRejectedValue(new Error('DB error'));

      await expect(getUserOrdersDB('user-1')).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalledWith(
        'getUserOrdersDB failed',
        expect.objectContaining({ userId: 'user-1', error: 'DB error' })
      );
    });
  });

  describe('getAdminOrdersDB', () => {
    it('should fetch all orders (no userId filter) with adminOrderInclude', async () => {
      order.findMany.mockResolvedValue([]);

      await getAdminOrdersDB();

      expect(order.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: adminOrderInclude,
      });
    });

    it('should return orders and log count', async () => {
      order.findMany.mockResolvedValue([{ id: 'o1' }]);

      expect(await getAdminOrdersDB()).toEqual([{ id: 'o1' }]);
      expect(logger.info).toHaveBeenCalledWith(
        'getAdminOrdersDB success',
        expect.objectContaining({ count: 1 })
      );
    });

    it('should log and rethrow on error', async () => {
      order.findMany.mockRejectedValue(new Error('DB error'));

      await expect(getAdminOrdersDB()).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalledWith(
        'getAdminOrdersDB failed',
        expect.objectContaining({ error: 'DB error' })
      );
    });
  });

  describe('getAdminOrderByIdDB', () => {
    it('should query by id only (no userId restriction)', async () => {
      order.findUnique.mockResolvedValue({ id: 'o1' });

      await getAdminOrderByIdDB('o1');

      expect(order.findUnique).toHaveBeenCalledWith({
        where: { id: 'o1' },
        include: adminOrderInclude,
      });
    });

    it('should return the order when found', async () => {
      order.findUnique.mockResolvedValue({ id: 'o1' });

      expect(await getAdminOrderByIdDB('o1')).toEqual({ id: 'o1' });
    });

    it('should return null when not found', async () => {
      order.findUnique.mockResolvedValue(null);

      expect(await getAdminOrderByIdDB('o1')).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'getAdminOrderByIdDB: order not found',
        expect.objectContaining({ orderId: 'o1' })
      );
    });

    it('should log and rethrow on error', async () => {
      order.findUnique.mockRejectedValue(new Error('DB error'));

      await expect(getAdminOrderByIdDB('o1')).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalledWith(
        'getAdminOrderByIdDB failed',
        expect.objectContaining({ orderId: 'o1', error: 'DB error' })
      );
    });
  });

  describe('updateOrderStatusDB', () => {
    it('should update the status with adminOrderInclude', async () => {
      order.update.mockResolvedValue({ id: 'o1', status: 'SHIPPED' });

      await updateOrderStatusDB('o1', 'SHIPPED' as any);

      expect(order.update).toHaveBeenCalledWith({
        where: { id: 'o1' },
        data: { status: 'SHIPPED' },
        include: adminOrderInclude,
      });
    });

    it('should return the updated order and log success', async () => {
      const updated = { id: 'o1', status: 'SHIPPED' };
      order.update.mockResolvedValue(updated);

      expect(await updateOrderStatusDB('o1', 'SHIPPED' as any)).toEqual(updated);
      expect(logger.info).toHaveBeenCalledWith(
        'updateOrderStatusDB success',
        expect.objectContaining({ orderId: 'o1', status: 'SHIPPED' })
      );
    });

    it('should log and rethrow on error (e.g. order does not exist)', async () => {
      order.update.mockRejectedValue(new Error('Record not found'));

      await expect(updateOrderStatusDB('o1', 'SHIPPED' as any)).rejects.toThrow('Record not found');
      expect(logger.error).toHaveBeenCalledWith(
        'updateOrderStatusDB failed',
        expect.objectContaining({ orderId: 'o1', status: 'SHIPPED', error: 'Record not found' })
      );
    });
  });
});
