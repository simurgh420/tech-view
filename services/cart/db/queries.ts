// services/cart/db/queries.ts

import prisma from '@/services/db/client';

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
