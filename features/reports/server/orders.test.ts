// features/reports/server/orders.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/prisma-adapter/client', () => ({
  default: {
    order: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import prisma from '@/features/prisma-adapter/client';
import { getOrderSummary, getRecentOrders } from './orders';

const order = prisma.order as any;

/** شبیه Decimal پریزما */
const decimal = (v: string | number) => ({ toString: () => String(v) });

const current = {
  start: new Date('2025-06-01T00:00:00.000Z'),
  end: new Date('2025-06-30T00:00:00.000Z'),
};
const previous = {
  start: new Date('2025-05-01T00:00:00.000Z'),
  end: new Date('2025-06-01T00:00:00.000Z'),
};

describe('reports/server/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrderSummary', () => {
    it('should count orders of the current period with inclusive end (lte)', async () => {
      order.count.mockResolvedValue(0);

      await getOrderSummary(current, previous);

      expect(order.count).toHaveBeenNthCalledWith(1, {
        where: { createdAt: { gte: current.start, lte: current.end } },
      });
    });

    it('should count orders of the previous period with exclusive end (lt)', async () => {
      order.count.mockResolvedValue(0);

      await getOrderSummary(current, previous);

      expect(order.count).toHaveBeenNthCalledWith(2, {
        where: { createdAt: { gte: previous.start, lt: previous.end } },
      });
    });

    it('should return current and previous counts in the right slots', async () => {
      order.count.mockResolvedValueOnce(12).mockResolvedValueOnce(7);

      expect(await getOrderSummary(current, previous)).toEqual({ current: 12, previous: 7 });
    });

    it('should not filter by status (all orders are counted)', async () => {
      order.count.mockResolvedValue(0);

      await getOrderSummary(current, previous);

      for (const [args] of order.count.mock.calls) {
        expect(args.where).not.toHaveProperty('status');
      }
    });

    it('should propagate errors', async () => {
      order.count.mockRejectedValue(new Error('DB error'));

      await expect(getOrderSummary(current, previous)).rejects.toThrow('DB error');
    });
  });

  describe('getRecentOrders', () => {
    const rawOrder = (overrides: Record<string, unknown> = {}) => ({
      id: 'o1',
      total: decimal('1500000'),
      status: 'PAID',
      createdAt: new Date('2025-06-14T10:00:00.000Z'),
      user: { name: 'علی رضایی' },
      ...overrides,
    });

    it('should fetch the 6 newest orders with a minimal select', async () => {
      order.findMany.mockResolvedValue([]);

      await getRecentOrders();

      expect(order.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      });
    });

    it('should map orders to a serializable shape', async () => {
      order.findMany.mockResolvedValue([rawOrder()]);

      expect(await getRecentOrders()).toEqual([
        {
          id: 'o1',
          total: 1500000,
          status: 'PAID',
          createdAt: '2025-06-14T10:00:00.000Z',
          userName: 'علی رضایی',
        },
      ]);
    });

    it('should convert Decimal total to a number (including fractions)', async () => {
      order.findMany.mockResolvedValue([rawOrder({ total: decimal('1500.75') })]);

      expect((await getRecentOrders())[0].total).toBe(1500.75);
    });

    it('should use the guest label when user is null', async () => {
      order.findMany.mockResolvedValue([rawOrder({ user: null })]);

      expect((await getRecentOrders())[0].userName).toBe('کاربر مهمان');
    });

    it('should use the guest label when user name is null', async () => {
      order.findMany.mockResolvedValue([rawOrder({ user: { name: null } })]);

      expect((await getRecentOrders())[0].userName).toBe('کاربر مهمان');
    });

    it('should keep the order returned by prisma', async () => {
      order.findMany.mockResolvedValue([rawOrder({ id: 'a' }), rawOrder({ id: 'b' })]);

      expect((await getRecentOrders()).map(o => o.id)).toEqual(['a', 'b']);
    });

    it('should return an empty array when there are no orders', async () => {
      order.findMany.mockResolvedValue([]);

      expect(await getRecentOrders()).toEqual([]);
    });

    it('should propagate errors', async () => {
      order.findMany.mockRejectedValue(new Error('DB error'));

      await expect(getRecentOrders()).rejects.toThrow('DB error');
    });
  });
});
