// services/cart/db/mutations.ts

import { Prisma } from '@/app/generated/prisma/client';
import prisma from '@/services/db/client';
import { CartErrors, productSelect } from '../constants';

async function ensureCart(tx: Prisma.TransactionClient, userId: string) {
  return tx.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}
// افزودن محصول به سبد
export async function addCartItem(userId: string, productId: string, quantity: number = 1) {
  return prisma.$transaction(async tx => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { price: true, stockQuantity: true },
    });
    if (!product) throw new Error(CartErrors.PRODUCT_NOT_FOUND);
    // 2. بررسی اولیه موجودی (برای حالت ایجاد جدید)
    if (quantity > product.stockQuantity) {
      throw new Error(CartErrors.INSUFFICIENT_STOCK);
    }
    const cart = await ensureCart(tx, userId);
    const existing = await tx.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existing) {
      const newQuantity = existing.quantity + quantity;
      if (newQuantity > product.stockQuantity) {
        throw new Error(CartErrors.INSUFFICIENT_STOCK_UPDATE);
      }
      return tx.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
        include: { product: { select: productSelect } },
      });
    }

    return tx.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        priceAtAdd: product.price,
      },
      include: { product: { select: productSelect } },
    });
  });
}
// بروزرسانی تعداد یک آیتم (با بررسی مالکیت)
export async function updateCartItemQuantity(itemId: string, userId: string, quantity: number) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      cart: { select: { userId: true } },
      product: { select: { stockQuantity: true } },
    },
  });
  if (!item) return null; // 404
  if (item.cart.userId !== userId) return 'forbidden'; // 403
  // 2. بررسی موجودی
  if (quantity > item.product.stockQuantity) {
    throw new Error(CartErrors.INSUFFICIENT_STOCK);
  }
  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: { product: { select: productSelect } },
  });
}

export async function removeCartItem(itemId: string, userId: string) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: { select: { userId: true } } },
  });
  if (!item) return null; // 404
  if (item.cart.userId !== userId) return 'forbidden'; // 403
  await prisma.cartItem.delete({ where: { id: itemId } });
  return true;
}
export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!cart) return false; // سبدی وجود ندارد
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
  return true;
}
