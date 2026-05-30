// services/wishlist/db/mutations.ts
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

export async function addToWishlist(userId: string, productId: string) {
  const startTime = Date.now();
  try {
    const item = await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
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
          },
        },
      },
    });
    logger.info('addToWishlist success', {
      userId,
      productId,
      wishlistItemId: item.id,
      duration: Date.now() - startTime,
    });
    return item;
  } catch (error) {
    logger.error('addToWishlist failed', {
      userId,
      productId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function removeFromWishlist(id: string) {
  const startTime = Date.now();
  try {
    await prisma.wishlistItem.delete({ where: { id } });
    logger.info('removeFromWishlist success', {
      id,
      duration: Date.now() - startTime,
    });
    return { success: true };
  } catch (error) {
    logger.error('removeFromWishlist failed', {
      id,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function deleteWishlistItemByUserAndProduct(userId: string, productId: string) {
  const startTime = Date.now();
  try {
    await prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    });
    logger.info('deleteWishlistItemByUserAndProduct success', {
      userId,
      productId,
      duration: Date.now() - startTime,
    });
    return { success: true };
  } catch (error) {
    logger.error('deleteWishlistItemByUserAndProduct failed', {
      userId,
      productId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function clearWishlist(userId: string) {
  const startTime = Date.now();
  try {
    await prisma.wishlistItem.deleteMany({ where: { userId } });
    logger.info('clearWishlist success', {
      userId,
      duration: Date.now() - startTime,
    });
    return { success: true };
  } catch (error) {
    logger.error('clearWishlist failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
