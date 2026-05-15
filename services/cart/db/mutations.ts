// services/cart/db/mutations.ts

import { Prisma } from '@/app/generated/prisma/client';
import prisma from '@/services/db/client';
import { CartErrors, productSelect } from '../constants';
import { logger } from '@/lib/logger';

async function ensureCart(tx: Prisma.TransactionClient, userId: string) {
  return tx.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

// افزودن محصول به سبد
export async function addCartItem(userId: string, productId: string, quantity: number = 1) {
  const startTime = Date.now();
  try {
    const result = await prisma.$transaction(async tx => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { price: true, stockQuantity: true },
      });
      if (!product) throw new Error(CartErrors.PRODUCT_NOT_FOUND);

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

    logger.info('addCartItem success', {
      userId,
      productId,
      quantity,
      cartItemId: result.id,
      duration: Date.now() - startTime,
    });
    return result;
  } catch (error) {
    logger.error('addCartItem failed', {
      userId,
      productId,
      quantity,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

// بروزرسانی تعداد یک آیتم (با بررسی مالکیت)
export async function updateCartItemQuantity(itemId: string, userId: string, quantity: number) {
  const startTime = Date.now();
  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: { select: { userId: true } },
        product: { select: { stockQuantity: true } },
      },
    });
    if (!item) return null;
    if (item.cart.userId !== userId) return 'forbidden';

    if (quantity > item.product.stockQuantity) {
      throw new Error(CartErrors.INSUFFICIENT_STOCK);
    }

    const result = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: { select: productSelect } },
    });

    logger.info('updateCartItemQuantity success', {
      userId,
      itemId,
      quantity,
      duration: Date.now() - startTime,
    });
    return result;
  } catch (error) {
    logger.error('updateCartItemQuantity failed', {
      userId,
      itemId,
      quantity,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function removeCartItem(itemId: string, userId: string) {
  const startTime = Date.now();
  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: { select: { userId: true } } },
    });
    if (!item) return null;
    if (item.cart.userId !== userId) return 'forbidden';

    await prisma.cartItem.delete({ where: { id: itemId } });

    logger.info('removeCartItem success', {
      userId,
      itemId,
      duration: Date.now() - startTime,
    });
    return true;
  } catch (error) {
    logger.error('removeCartItem failed', {
      userId,
      itemId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function clearCart(userId: string) {
  const startTime = Date.now();
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!cart) {
      // سبد وجود ندارد → عملیات پاک کردن موفقیت‌آمیز است (چیزی برای پاک کردن نبود)
      logger.info('clearCart - no cart found, considered successful', {
        userId,
        duration: Date.now() - startTime,
      });
      return true;
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    logger.info('clearCart success', {
      userId,
      duration: Date.now() - startTime,
    });
    return true;
  } catch (error) {
    logger.error('clearCart failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
