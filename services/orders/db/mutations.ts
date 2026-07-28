import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';
import { CreateOrderInput } from '@/types/order';

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
