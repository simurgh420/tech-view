// services/wishlist/db/queries.ts

import prisma from '@/services/db/client';

export async function getWishlist(userId: string) {
  return prisma.wishlistItem.findMany({
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
}
export async function getWishlistItem(id: string) {
  return prisma.wishlistItem.findUnique({
    where: { id },
    include: { product: { select: { id: true, title: true, slug: true, thumbnail: true } } },
  });
}
export async function isProductInWishlist(userId: string, productId: string) {
  const item = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  return !!item;
}
