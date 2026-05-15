// services/wishlist/db/queries.ts
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

export async function getWishlist(userId: string) {
  const startTime = Date.now();
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            price: true,
            discountPrice: true,
            isDiscounted: true,
            rating: true,
            reviewCount: true,
          },
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
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, title: true, slug: true } },
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
