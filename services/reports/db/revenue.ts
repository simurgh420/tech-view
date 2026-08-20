import prisma from '@/services/db/client';
import { Prisma } from '@/app/generated/prisma/client';

export const REVENUE_STATUSES = ['PAID', 'SHIPPED', 'DELIVERED'] as const;

type RevenuePeriod = {
  start: Date;
  end: Date;
};

export async function getRevenueSummary(current: RevenuePeriod, previous: RevenuePeriod) {
  const [currentRevenue, previousRevenue] = await Promise.all([
    prisma.order.aggregate({
      where: {
        status: {
          in: [...REVENUE_STATUSES],
        },
        createdAt: {
          gte: current.start,
          lte: current.end,
        },
      },
      _sum: {
        total: true,
      },
    }),

    prisma.order.aggregate({
      where: {
        status: {
          in: [...REVENUE_STATUSES],
        },
        createdAt: {
          gte: previous.start,
          lt: previous.end,
        },
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  return {
    current: Number(currentRevenue._sum.total ?? 0),
    previous: Number(previousRevenue._sum.total ?? 0),
  };
}

export async function getDailyRevenue(period: RevenuePeriod) {
  const rows = await prisma.$queryRaw<
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
      AND "createdAt" >= ${period.start}
      AND "createdAt" <= ${period.end}
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY day ASC
  `;

  return rows.map(row => ({
    date: row.day.toISOString(),
    revenue: Number(row.revenue),
  }));
}
