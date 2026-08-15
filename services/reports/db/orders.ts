import prisma from '@/services/db/client';

type OrdersPeriod = {
  start: Date;
  end: Date;
};

export async function getOrderSummary(current: OrdersPeriod, previous: OrdersPeriod) {
  const [currentOrders, previousOrders] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: {
          gte: current.start,
          lte: current.end,
        },
      },
    }),

    prisma.order.count({
      where: {
        createdAt: {
          gte: previous.start,
          lt: previous.end,
        },
      },
    }),
  ]);

  return {
    current: currentOrders,
    previous: previousOrders,
  };
}

export async function getRecentOrders() {
  const orders = await prisma.order.findMany({
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
  });

  return orders.map(order => ({
    id: order.id,
    total: Number(order.total),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    userName: order.user?.name ?? 'کاربر مهمان',
  }));
}
