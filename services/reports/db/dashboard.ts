import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

import { getDailyRevenue, getRevenueSummary } from './revenue';

import { getOrderSummary, getRecentOrders } from './orders';

import { getUserSummary } from './users';

const DAY_MS = 24 * 60 * 60 * 1000;

type Period = {
  start: Date;
  end: Date;
};

function getDashboardPeriods() {
  const now = new Date();

  const current: Period = {
    start: new Date(now.getTime() - 30 * DAY_MS),
    end: now,
  };

  const previous: Period = {
    start: new Date(now.getTime() - 60 * DAY_MS),
    end: current.start,
  };

  return {
    current,
    previous,
  };
}

function calculateGrowth(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

function buildRevenueSeries(
  rows: Array<{
    date: string;
    revenue: number;
  }>,
  period: Period
) {
  const revenueMap = new Map(rows.map(item => [item.date.slice(0, 10), item.revenue]));

  const result: Array<{
    date: string;
    revenue: number;
  }> = [];

  const current = new Date(period.start);

  current.setHours(0, 0, 0, 0);

  const end = new Date(period.end);

  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    const date = current.toISOString();

    const key = date.slice(0, 10);

    result.push({
      date,
      revenue: revenueMap.get(key) ?? 0,
    });

    current.setDate(current.getDate() + 1);
  }

  return result;
}

export async function getDashboardOverview() {
  const startTime = Date.now();

  try {
    const { current, previous } = getDashboardPeriods();

    const [revenue, orders, users, products, dailyRevenue, recentOrders] = await Promise.all([
      getRevenueSummary(current, previous),

      getOrderSummary(current, previous),

      getUserSummary(current, previous),

      prisma.product.count({
        where: {
          status: 'PUBLISHED',
        },
      }),

      getDailyRevenue(current),

      getRecentOrders(),
    ]);

    const revenueByDay = buildRevenueSeries(dailyRevenue, current);

    const result = {
      stats: {
        revenue: revenue.current,
        revenueGrowth: calculateGrowth(revenue.current, revenue.previous),

        orders: orders.current,
        ordersGrowth: calculateGrowth(orders.current, orders.previous),

        users: users.current,
        usersGrowth: calculateGrowth(users.current, users.previous),

        products,
      },

      revenueByDay,

      recentOrders,
    };

    logger.info('getDashboardOverview success', {
      duration: Date.now() - startTime,
    });

    return result;
  } catch (error) {
    logger.error('getDashboardOverview failed', {
      error: error instanceof Error ? error.message : 'Unknown error',

      duration: Date.now() - startTime,
    });

    throw error;
  }
}
