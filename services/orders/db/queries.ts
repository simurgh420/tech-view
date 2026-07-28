import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';
import { orderInclude } from '../constants';

export async function getOrderByIdDB(orderId: string, userId: string) {
  const startTime = Date.now();

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: orderInclude,
    });

    if (!order) {
      logger.info('getOrderByIdDB: order not found', {
        orderId,
        userId,
        duration: Date.now() - startTime,
      });

      return null;
    }

    logger.info('getOrderByIdDB success', {
      orderId,
      userId,
      duration: Date.now() - startTime,
    });

    return order;
  } catch (error) {
    logger.error('getOrderByIdDB failed', {
      orderId,
      userId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

export async function getUserOrdersDB(userId: string) {
  const startTime = Date.now();

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: orderInclude,
    });

    logger.info('getUserOrdersDB success', {
      userId,
      count: orders.length,
      duration: Date.now() - startTime,
    });

    return orders;
  } catch (error) {
    logger.error('getUserOrdersDB failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}
