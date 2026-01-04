// services/wishlist/db/mutations.ts
import prisma from '@/services/db/client';

export async function addToWishlist(payload: { userId: string; productId: string }) {
  const { userId, productId } = payload;
  return prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
    include: { product: { select: { id: true, title: true, slug: true, thumbnail: true } } },
  });
}

export async function removeFromWishlist(id: string) {
  await prisma.wishlistItem.delete({ where: { id } });
  return { success: true };
}
export async function deleteWishlistItemByUserAndProduct(payload: {
  userId: string;
  productId: string;
}) {
  const { userId, productId } = payload;
  await prisma.wishlistItem.delete({ where: { userId_productId: { userId, productId } } });
  return { success: true };
}
//برای داشبورد
export async function clearWishlist(userId: string) {
  await prisma.wishlistItem.deleteMany({ where: { userId } });
  return { success: true };
}
