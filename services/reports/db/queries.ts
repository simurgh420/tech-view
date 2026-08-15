// services/reports/db/queries.ts

import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';
import { Prisma } from '@/app/generated/prisma/client';

const REVENUE_STATUSES = ['PAID', 'SHIPPED', 'DELIVERED'] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

function getPeriodDates() {
  const now = new Date();

  const currentStart = new Date(now.getTime() - 30 * DAY_MS);
  const previousStart = new Date(now.getTime() - 60 * DAY_MS);

  return {
    now,
    currentStart,
    previousStart,
  };
}

function calculateGrowth(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

export async function getDashboardStats() {
  const startTime = Date.now();

  try {
    const { now, currentStart, previousStart } = getPeriodDates();

    const [
      currentRevenueAgg,
      previousRevenueAgg,

      currentOrders,
      previousOrders,

      currentUsers,
      previousUsers,

      totalProducts,

      recentOrders,

      dailyRevenue,
    ] = await Promise.all([
      // Current 30 days revenue
      prisma.order.aggregate({
        where: {
          status: {
            in: [...REVENUE_STATUSES],
          },
          createdAt: {
            gte: currentStart,
            lte: now,
          },
        },
        _sum: {
          total: true,
        },
      }),

      // Previous 30 days revenue
      prisma.order.aggregate({
        where: {
          status: {
            in: [...REVENUE_STATUSES],
          },
          createdAt: {
            gte: previousStart,
            lt: currentStart,
          },
        },
        _sum: {
          total: true,
        },
      }),

      // Current 30 days orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: currentStart,
            lte: now,
          },
        },
      }),

      // Previous 30 days orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: previousStart,
            lt: currentStart,
          },
        },
      }),

      // Current 30 days users
      prisma.user.count({
        where: {
          createdAt: {
            gte: currentStart,
            lte: now,
          },
        },
      }),

      // Previous 30 days users
      prisma.user.count({
        where: {
          createdAt: {
            gte: previousStart,
            lt: currentStart,
          },
        },
      }),

      // Total published products
      prisma.product.count({
        where: {
          status: 'PUBLISHED',
        },
      }),

      // Recent orders
      prisma.order.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 6,
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      }),

      // Revenue by day
      prisma.$queryRaw<
        Array<{
          day: Date;
          revenue: Prisma.Decimal;
        }>
      >`
        SELECT
          DATE_TRUNC('day', "createdAt") AS day,
          COALESCE(SUM(total), 0) AS revenue
        FROM "Order"
        WHERE
          status IN ('PAID', 'SHIPPED', 'DELIVERED')
          AND "createdAt" >= ${currentStart}
          AND "createdAt" <= ${now}
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY day ASC
      `,
    ]);

    const currentRevenue = Number(currentRevenueAgg._sum.total ?? 0);
    const previousRevenue = Number(previousRevenueAgg._sum.total ?? 0);

    const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);

    const ordersGrowth = calculateGrowth(currentOrders, previousOrders);

    const usersGrowth = calculateGrowth(currentUsers, previousUsers);

    const revenueByDay = dailyRevenue.map(item => ({
      date: item.day.toISOString(),
      revenue: Number(item.revenue),
    }));

    logger.info('getDashboardStats success', {
      duration: Date.now() - startTime,
    });

    return {
      stats: {
        revenue: currentRevenue,
        revenueGrowth,

        orders: currentOrders,
        ordersGrowth,

        users: currentUsers,
        usersGrowth,

        products: totalProducts,
      },

      revenueByDay,

      recentOrders: recentOrders.map(order => ({
        id: order.id,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        userName: order.user?.name ?? 'کاربر مهمان',
      })),
    };
  } catch (error) {
    logger.error('getDashboardStats failed', {
      error: error instanceof Error ? error.message : 'Unknown error',

      duration: Date.now() - startTime,
    });

    throw error;
  }
}
