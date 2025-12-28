// services/cart/db/mutations.ts

import prisma from '@/services/db/client';

export async function addCartItem(data: { cartId: string; productId: string; quantity?: number }) {
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
    select: { price: true },
  });
  if (!product) {
    throw new Error('Product not found');
  }
  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: data.cartId,
      productId: data.productId,
    },
  });
  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + (data.quantity ?? 1),
      },
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
  return prisma.cartItem.create({
    data: {
      cartId: data.cartId,
      productId: data.productId,
      quantity: data.quantity ?? 1,
      priceAtAdd: product.price,
    },
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

export async function clearCart(cartId: string) {
  await prisma.cartItem.deleteMany({ where: { cartId } });
  return { success: true };
}
