// services/cart/db/mutations.ts

import prisma from '@/services/db/client';

export async function addCartItem(data: { userId: string; productId: string; quantity?: number }) {
  const { userId, productId, quantity = 1 } = data;
  return prisma.$transaction(async tx => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { price: true },
    });
    if (!product) throw new Error('Product not found');
    const existing = await tx.cartItem.findFirst({ where: { cartId: userId, productId } });
    if (existing) {
      return tx.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
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
    return tx.cartItem.create({
      data: { cartId: userId, productId, quantity, priceAtAdd: product.price },
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
  });
}
export async function updateCartItemQuantity(id: string, quantity: number) {
  return prisma.cartItem.update({
    where: { id },
    data: { quantity },
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

export async function removeCartItem(id: string) {
  await prisma.cartItem.delete({ where: { id } });
  return { success: true };
}

export async function clearCart(userId: string) {
  await prisma.cartItem.deleteMany({ where: { cartId: userId } });
  return { success: true };
}
