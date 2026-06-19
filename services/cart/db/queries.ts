import prisma from '@/services/db/client';
import { productSelect } from '../constants';
import { logger } from '@/lib/logger';

export async function getCart(userId: string) {
  const startTime = Date.now();
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!cart) {
      logger.info('getCart: no cart found', { userId, duration: Date.now() - startTime });
      return [];
    }
    const items = await getCartItems(cart.id);
    logger.info('getCart success', {
      userId,
      itemCount: items.length,
      duration: Date.now() - startTime,
    });
    return items;
  } catch (error) {
    logger.error('getCart failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getCartItems(cartId: string) {
  const startTime = Date.now();
  try {
    const items = await prisma.cartItem.findMany({
      where: { cartId },
      orderBy: { createdAt: 'desc' },
      include: { product: { select: productSelect } },
    });
    logger.info('getCartItems success', {
      cartId,
      itemCount: items.length,
      duration: Date.now() - startTime,
    });
    return items;
  } catch (error) {
    logger.error('getCartItems failed', {
      cartId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
export async function getCartForCheckout(userId: string) {
  const startTime = Date.now();

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!cart) {
      logger.info('getCartForCheckout: no cart found', {
        userId,
        duration: Date.now() - startTime,
      });
      return null;
    }

    const items = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      orderBy: { createdAt: 'desc' },
      include: { product: { select: productSelect } },
    });

    logger.info('getCartForCheckout success', {
      userId,
      itemCount: items.length,
      duration: Date.now() - startTime,
    });

    return {
      cartId: cart.id,
      items,
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
