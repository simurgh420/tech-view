// features/reports/server/revenue.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/prisma-adapter/client', () => ({
  default: {
    order: { aggregate: vi.fn() },
    $queryRaw: vi.fn(),
  },
}));

// Prisma فقط به‌عنوان تایپ استفاده شده؛ برای جلوگیری از لود کلاینت واقعی mock می‌شود
vi.mock('@/app/generated/prisma/client', () => ({ Prisma: {} }));

import prisma from '@/features/prisma-adapter/client';
import { REVENUE_STATUSES, getRevenueSummary, getDailyRevenue } from './revenue';

const order = prisma.order as any;
const queryRaw = prisma.$queryRaw as unknown as ReturnType<typeof vi.fn>;

const decimal = (v: string | number) => ({ toString: () => String(v) });

const current = {
  start: new Date('2025-06-01T00:00:00.000Z'),
  end: new Date('2025-06-30T00:00:00.000Z'),
};
const previous = {
  start: new Date('2025-05-01T00:00:00.000Z'),
  end: new Date('2025-06-01T00:00:00.000Z'),
};

describe('reports/server/revenue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('REVENUE_STATUSES', () => {
    it('should contain only statuses that represent real revenue', () => {
      expect([...REVENUE_STATUSES]).toEqual(['PAID', 'SHIPPED', 'DELIVERED']);
    });

    it('should NOT contain PENDING or CANCELED', () => {
      expect(REVENUE_STATUSES).not.toContain('PENDING');
      expect(REVENUE_STATUSES).not.toContain('CANCELED');
    });
  });

  describe('getRevenueSummary', () => {
    it('should aggregate the current period (lte) with revenue statuses', async () => {
      order.aggregate.mockResolvedValue({ _sum: { total: null } });

      await getRevenueSummary(current, previous);

      expect(order.aggregate).toHaveBeenNthCalledWith(1, {
        where: {
          status: { in: [...REVENUE_STATUSES] },
          createdAt: { gte: current.start, lte: current.end },
        },
        _sum: { total: true },
      });
    });

    it('should aggregate the previous period (lt) with revenue statuses', async () => {
      order.aggregate.mockResolvedValue({ _sum: { total: null } });

      await getRevenueSummary(current, previous);

      expect(order.aggregate).toHaveBeenNthCalledWith(2, {
        where: {
          status: { in: [...REVENUE_STATUSES] },
          createdAt: { gte: previous.start, lt: previous.end },
        },
        _sum: { total: true },
      });
    });

    it('should convert Decimal sums to numbers in the right slots', async () => {
      order.aggregate
        .mockResolvedValueOnce({ _sum: { total: decimal('1000000.5') } })
        .mockResolvedValueOnce({ _sum: { total: decimal('400000') } });

      expect(await getRevenueSummary(current, previous)).toEqual({
        current: 1000000.5,
        previous: 400000,
      });
    });

    it('should return 0 when there are no matching orders (sum is null)', async () => {
      order.aggregate.mockResolvedValue({ _sum: { total: null } });

      expect(await getRevenueSummary(current, previous)).toEqual({ current: 0, previous: 0 });
    });

    it('should propagate errors', async () => {
      order.aggregate.mockRejectedValue(new Error('DB error'));

      await expect(getRevenueSummary(current, previous)).rejects.toThrow('DB error');
    });
  });

  describe('getDailyRevenue', () => {
    it('should bind the period start and end as query parameters', async () => {
      queryRaw.mockResolvedValue([]);

      await getDailyRevenue(current);

      expect(queryRaw).toHaveBeenCalledTimes(1);
      const [, ...values] = queryRaw.mock.calls[0];
      expect(values).toEqual([current.start, current.end]);
    });

    it('should use the same statuses as REVENUE_STATUSES in the SQL', async () => {
      queryRaw.mockResolvedValue([]);

      await getDailyRevenue(current);

      const [strings] = queryRaw.mock.calls[0];
      const sql = (strings as string[]).join('?');
      for (const status of REVENUE_STATUSES) {
        expect(sql).toContain(`'${status}'`);
      }
    });

    it('should map rows to ISO date and numeric revenue', async () => {
      queryRaw.mockResolvedValue([
        { day: new Date('2025-06-01T00:00:00.000Z'), revenue: decimal('1500.5') },
        { day: new Date('2025-06-02T00:00:00.000Z'), revenue: decimal(0) },
      ]);

      expect(await getDailyRevenue(current)).toEqual([
        { date: '2025-06-01T00:00:00.000Z', revenue: 1500.5 },
        { date: '2025-06-02T00:00:00.000Z', revenue: 0 },
      ]);
    });

    it('should return an empty array when there are no rows', async () => {
      queryRaw.mockResolvedValue([]);

      expect(await getDailyRevenue(current)).toEqual([]);
    });

    it('should propagate errors', async () => {
      queryRaw.mockRejectedValue(new Error('SQL error'));

      await expect(getDailyRevenue(current)).rejects.toThrow('SQL error');
    });
  });
});
