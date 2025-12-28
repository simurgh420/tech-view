// services/wishlist/db/mutations.ts

import prisma from '@/services/db/client';

export async function addToWishlist(data: { userId: string; productId: string }) {
  return prisma.wishlistItem.create({
    data,
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

export async function removeFromWishlist(id: string) {
  await prisma.wishlistItem.delete({ where: { id } });
  return { success: true };
}
// برای حذف با userId + productId (بدون نیاز به id مستقیم)
export async function removeFromWishlistByUserAndProduct(userId: string, productId: string) {
  await prisma.wishlistItem.delete({
    where: {
      userId_productId: { userId, productId },
    },
  });
  return { success: true };
}
