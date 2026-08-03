// services/wishlist/db/queries.ts
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';
import { wishlistAdminProductSelect, wishlistProductSelect, wishlistUserSelect } from './selects';

export async function getWishlist(userId: string) {
  const startTime = Date.now();
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: wishlistProductSelect,
        },
      },
    });
    logger.info('getWishlist success', {
      userId,
      count: items.length,
      duration: Date.now() - startTime,
    });
    return items;
  } catch (error) {
    logger.error('getWishlist failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getWishlistItemById(id: string) {
  const startTime = Date.now();
  try {
    const item = await prisma.wishlistItem.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!item) {
      logger.info('getWishlistItemById: not found', { id, duration: Date.now() - startTime });
      return null;
    }
    logger.info('getWishlistItemById success', { id, duration: Date.now() - startTime });
    return item;
  } catch (error) {
    logger.error('getWishlistItemById failed', {
      id,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function isProductInWishlist(userId: string, productId: string) {
  const startTime = Date.now();
  try {
    const item = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    logger.info('isProductInWishlist success', {
      userId,
      productId,
      exists: !!item,
      duration: Date.now() - startTime,
    });
    return !!item;
  } catch (error) {
    logger.error('isProductInWishlist failed', {
      userId,
      productId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

// ======================== for admin ========================
export async function getAllWishlistItems() {
  const startTime = Date.now();
  try {
    const items = await prisma.wishlistItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: wishlistUserSelect },
        product: { select: wishlistAdminProductSelect },
      },
    });
    logger.info('getAllWishlistItems success', {
      count: items.length,
      duration: Date.now() - startTime,
    });
    return items;
  } catch (error) {
    logger.error('getAllWishlistItems failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
