// features/reports/server/dashboard.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/features/prisma-adapter/client', () => ({
  default: {
    product: { count: vi.fn() },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('./orders', () => ({
  getOrderSummary: vi.fn(),
  getRecentOrders: vi.fn(),
}));

vi.mock('./revenue', () => ({
  getRevenueSummary: vi.fn(),
  getDailyRevenue: vi.fn(),
}));

vi.mock('./users', () => ({
  getUserSummary: vi.fn(),
}));

import prisma from '@/features/prisma-adapter/client';
import { logger } from '@/lib/logger';
import { getOrderSummary, getRecentOrders } from './orders';
import { getRevenueSummary, getDailyRevenue } from './revenue';
import { getUserSummary } from './users';
import { getDashboardOverview } from './dashboard';

const productCount = prisma.product.count as unknown as ReturnType<typeof vi.fn>;

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2025-06-15T12:00:00.000Z');

function setDefaults() {
  vi.mocked(getRevenueSummary).mockResolvedValue({ current: 0, previous: 0 });
  vi.mocked(getOrderSummary).mockResolvedValue({ current: 0, previous: 0 });
  vi.mocked(getUserSummary).mockResolvedValue({ current: 0, previous: 0 });
  vi.mocked(getDailyRevenue).mockResolvedValue([]);
  vi.mocked(getRecentOrders).mockResolvedValue([]);
  productCount.mockResolvedValue(0);
}

describe('reports/server/dashboard › getDashboardOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    setDefaults();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('بازه‌های زمانی', () => {
    it('should use the last 30 days as current and the 30 days before as previous', async () => {
      await getDashboardOverview();

      const current = { start: new Date(NOW.getTime() - 30 * DAY), end: NOW };
      const previous = { start: new Date(NOW.getTime() - 60 * DAY), end: current.start };

      expect(getRevenueSummary).toHaveBeenCalledWith(current, previous);
      expect(getOrderSummary).toHaveBeenCalledWith(current, previous);
      expect(getUserSummary).toHaveBeenCalledWith(current, previous);
    });

    it('should request daily revenue for the current period only', async () => {
      await getDashboardOverview();

      expect(getDailyRevenue).toHaveBeenCalledWith({
        start: new Date(NOW.getTime() - 30 * DAY),
        end: NOW,
      });
    });

    it('should count only PUBLISHED products', async () => {
      await getDashboardOverview();

      expect(productCount).toHaveBeenCalledWith({ where: { status: 'PUBLISHED' } });
    });
  });

  describe('stats', () => {
    it('should map current values, growth and product count', async () => {
      vi.mocked(getRevenueSummary).mockResolvedValue({ current: 150, previous: 100 });
      vi.mocked(getOrderSummary).mockResolvedValue({ current: 30, previous: 20 });
      vi.mocked(getUserSummary).mockResolvedValue({ current: 5, previous: 10 });
      productCount.mockResolvedValue(42);

      const { stats } = await getDashboardOverview();

      expect(stats).toEqual({
        revenue: 150,
        revenueGrowth: 50,
        orders: 30,
        ordersGrowth: 50,
        users: 5,
        usersGrowth: -50,
        products: 42,
      });
    });

    // [current, previous, expectedGrowth]
    it.each([
      [150, 100, 50],
      [50, 100, -50],
      [100, 100, 0],
      [0, 100, -100],
      [10, 0, 100], // قبلی صفر و فعلی مثبت → ۱۰۰٪
      [0, 0, 0],
    ])('should calculate growth for current=%i previous=%i as %i', async (cur, prev, expected) => {
      vi.mocked(getRevenueSummary).mockResolvedValue({ current: cur, previous: prev });
      vi.mocked(getOrderSummary).mockResolvedValue({ current: cur, previous: prev });
      vi.mocked(getUserSummary).mockResolvedValue({ current: cur, previous: prev });

      const { stats } = await getDashboardOverview();

      expect(stats.revenueGrowth).toBe(expected);
      expect(stats.ordersGrowth).toBe(expected);
      expect(stats.usersGrowth).toBe(expected);
    });

    it('should not round growth', async () => {
      vi.mocked(getRevenueSummary).mockResolvedValue({ current: 4, previous: 3 });

      const { stats } = await getDashboardOverview();

      expect(stats.revenueGrowth).toBeCloseTo(33.3333, 3);
    });
  });

  describe('revenueByDay', () => {
    it('should return one entry per day from start to end (inclusive), ascending', async () => {
      const { revenueByDay } = await getDashboardOverview();

      expect(revenueByDay).toHaveLength(31);
      expect(revenueByDay[0].date).toBe('2025-05-16T00:00:00.000Z');
      expect(revenueByDay[30].date).toBe('2025-06-15T00:00:00.000Z');

      for (let i = 1; i < revenueByDay.length; i++) {
        const diff =
          new Date(revenueByDay[i].date).getTime() - new Date(revenueByDay[i - 1].date).getTime();
        expect(diff).toBe(DAY);
      }
    });

    it('should fill days without data with revenue 0', async () => {
      const { revenueByDay } = await getDashboardOverview();

      expect(revenueByDay.every(d => d.revenue === 0)).toBe(true);
    });

    it('should place revenue on the matching day and keep the others at 0', async () => {
      vi.mocked(getDailyRevenue).mockResolvedValue([
        { date: '2025-05-20T00:00:00.000Z', revenue: 500 },
        { date: '2025-06-01T00:00:00.000Z', revenue: 1200 },
      ]);

      const { revenueByDay } = await getDashboardOverview();

      expect(revenueByDay.find(d => d.date.startsWith('2025-05-20'))!.revenue).toBe(500);
      expect(revenueByDay.find(d => d.date.startsWith('2025-06-01'))!.revenue).toBe(1200);
      expect(revenueByDay.filter(d => d.revenue !== 0)).toHaveLength(2);
    });
    it('should match rows by date part only (ignoring the time)', async () => {
      vi.mocked(getDailyRevenue).mockResolvedValue([
        { date: '2025-05-20T13:45:00.000Z', revenue: 777 },
      ]);

      const { revenueByDay } = await getDashboardOverview();

      expect(revenueByDay.find(d => d.date.startsWith('2025-05-20'))!.revenue).toBe(777);
    });

    it('should ignore rows outside the period', async () => {
      vi.mocked(getDailyRevenue).mockResolvedValue([
        { date: '2024-01-01T00:00:00.000Z', revenue: 999 },
      ]);

      const { revenueByDay } = await getDashboardOverview();

      expect(revenueByDay).toHaveLength(31);
      expect(revenueByDay.every(d => d.revenue === 0)).toBe(true);
    });
  });

  describe('recentOrders', () => {
    it('should pass recent orders through unchanged', async () => {
      const recent = [
        {
          id: 'o1',
          total: 1000,
          status: 'PAID',
          createdAt: '2025-06-14T10:00:00.000Z',
          userName: 'علی',
        },
      ];
      vi.mocked(getRecentOrders).mockResolvedValue(recent as any);

      expect((await getDashboardOverview()).recentOrders).toEqual(recent);
    });
  });

  describe('لاگ و خطا', () => {
    it('should log success', async () => {
      await getDashboardOverview();

      expect(logger.info).toHaveBeenCalledWith('getDashboardOverview success', {
        duration: expect.any(Number),
      });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log and rethrow when a dependency fails', async () => {
      const error = new Error('revenue failed');
      vi.mocked(getRevenueSummary).mockRejectedValue(error);

      await expect(getDashboardOverview()).rejects.toBe(error);

      expect(logger.error).toHaveBeenCalledWith('getDashboardOverview failed', {
        error: 'revenue failed',
        duration: expect.any(Number),
      });
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should log and rethrow when product count fails', async () => {
      productCount.mockRejectedValue(new Error('count failed'));

      await expect(getDashboardOverview()).rejects.toThrow('count failed');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should log "Unknown error" when a non-Error is thrown', async () => {
      vi.mocked(getRecentOrders).mockRejectedValue('boom');

      await expect(getDashboardOverview()).rejects.toBe('boom');
      expect(logger.error).toHaveBeenCalledWith(
        'getDashboardOverview failed',
        expect.objectContaining({ error: 'Unknown error' })
      );
    });
  });
});
