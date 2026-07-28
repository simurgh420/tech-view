import prisma from '@/services/db/client';
import { productSelect } from '../constants';
import { logger } from '@/lib/logger';

async function fetchCartWithItems(userId: string) {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: 'desc' },
        include: { product: { select: productSelect } },
      },
    },
  });
}

export async function getCart(userId: string) {
  const startTime = Date.now();
  try {
    const cart = await fetchCartWithItems(userId);

    if (!cart) {
      logger.info('getCart: no cart found', { userId, duration: Date.now() - startTime });
      return [];
    }

    logger.info('getCart success', {
      userId,
      itemCount: cart.items.length,
      duration: Date.now() - startTime,
    });

    return cart.items;
  } catch (error) {
    logger.error('getCart failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getCartForCheckout(userId: string) {
  const startTime = Date.now();
  try {
    const cart = await fetchCartWithItems(userId);

    if (!cart) {
      logger.info('getCartForCheckout: no cart found', {
        userId,
        duration: Date.now() - startTime,
      });
      return null;
    }

    logger.info('getCartForCheckout success', {
      userId,
      itemCount: cart.items.length,
      duration: Date.now() - startTime,
    });

    return {
      cartId: cart.id,
      items: cart.items,
    };
  } catch (error) {
    logger.error('getCartForCheckout failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
