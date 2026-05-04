// services/cart/db/queries.ts

import prisma from '@/services/db/client';
import { productSelect } from './constants';

export async function getCart(userId: string) {
  // ابتدا سبد کاربر را پیدا کن (اگر نبود برنمی‌گردد)
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!cart) return [];
  return prisma.cartItem.findMany({
    where: { cartId: cart.id },
    orderBy: { createdAt: 'desc' },
    include: { product: { select: productSelect } },
  });
}
export async function getCartItems(cartId: string) {
  return prisma.cartItem.findMany({
    where: { cartId },
    orderBy: { createdAt: 'desc' },
    include: { product: { select: productSelect } },
  });
}
