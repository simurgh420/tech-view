import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';
import { CreateOrderInput } from '@/types/order';
import { orderInclude } from '../constants';

export async function createOrderDB(userId: string, data: CreateOrderInput) {
  const startTime = Date.now();

  try {
    const order = await prisma.order.create({
      data: {
        userId,
        total: data.total,
        items: {
          create: data.items,
        },
        address: {
          create: data.address,
        },
      },
    });

    logger.info('createOrderDB success', {
      orderId: order.id,
      userId,
      total: data.total,
      itemCount: data.items.length,
      duration: Date.now() - startTime,
    });

    return order;
  } catch (error) {
    logger.error('createOrderDB failed', {
      userId,
      total: data.total,
      itemCount: data.items.length,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}
export async function cancelOrderDB(orderId: string, userId: string) {
  const startTime = Date.now();

  try {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId } });

    if (!order) {
      logger.warn('cancelOrderDB: order not found or not owned by user', { orderId, userId });
      return { success: false, reason: 'NOT_FOUND' as const };
    }

    // ✅ فقط PENDING قابل‌لغو است
    if (order.status !== 'PENDING') {
      logger.warn('cancelOrderDB: order not cancelable', {
        orderId,
        userId,
        status: order.status,
      });
      return { success: false, reason: 'NOT_CANCELABLE' as const };
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELED' },
      include: orderInclude,
    });

    logger.info('cancelOrderDB success', { orderId, userId, duration: Date.now() - startTime });
    return { success: true as const, order: updated };
  } catch (error) {
    logger.error('cancelOrderDB failed', {
      orderId,
      userId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
