// services/cart/db/queries.ts

import prisma from '@/services/db/client';
// NOTE: cartId currently is a free-form session identifier (cartId) in schema.
//  // Here we treat userId as grouping in API; adapt if you store cartId per user.
export async function getCart(userId: string) {
  return prisma.cartItem.findMany({
    where: { cartId: userId },
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
          stockQuantity: true,
          isInStock: true,
        },
      },
    },
  });
}
export async function getCartItems(cartId: string) {
  return prisma.cartItem.findMany({
    where: { cartId },
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
          stockQuantity: true,
          isInStock: true,
        },
      },
    },
  });
}
