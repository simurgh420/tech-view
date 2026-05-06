// services/wishlist/db/mutations.ts
import prisma from '@/services/db/client';

export async function addToWishlist(userId: string, productId: string) {
  return prisma.wishlistItem.upsert({
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
}
// ======================== for admin ========================

export async function removeFromWishlist(id: string) {
  await prisma.wishlistItem.delete({ where: { id } });
  return { success: true };
}
export async function deleteWishlistItemByUserAndProduct(userId: string, productId: string) {
  await prisma.wishlistItem.delete({
    where: { userId_productId: { userId, productId } },
  });
  return { success: true };
}
// پاک کردن کل لیست (برای خود کاربر یا ادمین)
export async function clearWishlist(userId: string) {
  await prisma.wishlistItem.deleteMany({ where: { userId } });
  return { success: true };
}
