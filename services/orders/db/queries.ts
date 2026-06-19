import prisma from '@/services/db/client';

export async function getOrderByIdDB(orderId: string, userId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: true,
      address: true,
    },
  });
}

export async function getUserOrdersDB(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      address: true,
    },
  });
}
