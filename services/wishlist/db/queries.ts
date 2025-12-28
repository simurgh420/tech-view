// services/wishlist/db/queries.ts

import prisma from '@/services/db/client';

export async function getWishlistByUserId(userId: string) {
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
