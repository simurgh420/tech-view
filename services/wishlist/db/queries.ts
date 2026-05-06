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
// فقط برای چک وجود و مالکیت
export async function getWishlistItemById(id: string) {
  return prisma.wishlistItem.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });
}
// بررسی وجود محصول در لیست کاربر
export async function isProductInWishlist(userId: string, productId: string) {
  const item = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  return !!item;
}
// ======================== for admin ========================
export async function getAllWishlistItems() {
  return prisma.wishlistItem.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, title: true, slug: true } },
    },
  });
}
