import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from '@/services/cart/db/mutations';
import prisma from '@/services/db/client';
import { CartErrors } from '@/services/cart/constants';
import { logger } from '@/lib/logger';

// Mock Prisma client
vi.mock('@/services/db/client', () => ({
  default: {
    $transaction: vi.fn(callback => callback(prisma)),
    cart: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    cartItem: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to create transaction mock
const mockTx = (overrides: any = {}) => ({
  cart: {
    upsert: vi.fn(),
    ...overrides.cart,
  },
  cartItem: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    ...overrides.cartItem,
  },
  product: {
    findUnique: vi.fn(),
    ...overrides.product,
  },
});

describe('Cart DB Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addCartItem', () => {
    const userId = 'user-1';
    const productId = 'prod-1';
    const quantity = 2;
    const mockProduct = { id: productId, price: 100, stockQuantity: 10 };
    const mockCart = { id: 'cart-1', userId };
    const mockCartItem = { id: 'item-1', cartId: mockCart.id, productId, quantity };

    it('should add new item to cart successfully', async () => {
      const tx = mockTx();
      (tx.product.findUnique as any).mockResolvedValue(mockProduct);
      (tx.cart.upsert as any).mockResolvedValue(mockCart);
      (tx.cartItem.findFirst as any).mockResolvedValue(null);
      (tx.cartItem.create as any).mockResolvedValue(mockCartItem);
      (prisma.$transaction as any).mockImplementationOnce(
        async (fn: (arg0: { cart: any; cartItem: any; product: any }) => any) => fn(tx)
      );

      const result = await addCartItem(userId, productId, quantity);

      expect(result).toEqual(mockCartItem);
      expect(tx.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        select: { price: true, stockQuantity: true },
      });
      expect(tx.cart.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: {},
        create: { userId },
      });
      expect(tx.cartItem.findFirst).toHaveBeenCalledWith({
        where: { cartId: mockCart.id, productId },
      });
      expect(tx.cartItem.create).toHaveBeenCalledWith({
        data: {
          cartId: mockCart.id,
          productId,
          quantity,
          priceAtAdd: mockProduct.price,
        },
        include: { product: { select: expect.any(Object) } },
      });
      expect(logger.info).toHaveBeenCalled();
    });

    it('should update existing item quantity', async () => {
      const existingItem = { id: 'item-1', cartId: mockCart.id, productId, quantity: 1 };
      const newQuantity = 1 + quantity; // 3
      const updatedItem = { ...existingItem, quantity: newQuantity };
      const tx = mockTx();
      (tx.product.findUnique as any).mockResolvedValue(mockProduct);
      (tx.cart.upsert as any).mockResolvedValue(mockCart);
      (tx.cartItem.findFirst as any).mockResolvedValue(existingItem);
      (tx.cartItem.update as any).mockResolvedValue(updatedItem);
      (prisma.$transaction as any).mockImplementationOnce(
        async (fn: (arg0: { cart: any; cartItem: any; product: any }) => any) => fn(tx)
      );

      const result = await addCartItem(userId, productId, quantity);

      expect(result).toEqual(updatedItem);
      expect(tx.cartItem.update).toHaveBeenCalledWith({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: { select: expect.any(Object) } },
      });
    });

    it('should throw error if product not found', async () => {
      const tx = mockTx();
      (tx.product.findUnique as any).mockResolvedValue(null);
      (prisma.$transaction as any).mockImplementationOnce(
        async (fn: (arg0: { cart: any; cartItem: any; product: any }) => any) => fn(tx)
      );

      await expect(addCartItem(userId, productId, quantity)).rejects.toThrow(
        CartErrors.PRODUCT_NOT_FOUND
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it('should throw error if insufficient stock for new item', async () => {
      const tx = mockTx();
      (tx.product.findUnique as any).mockResolvedValue({ ...mockProduct, stockQuantity: 1 });
      (prisma.$transaction as any).mockImplementationOnce(
        async (fn: (arg0: { cart: any; cartItem: any; product: any }) => any) => fn(tx)
      );

      await expect(addCartItem(userId, productId, quantity)).rejects.toThrow(
        CartErrors.INSUFFICIENT_STOCK
      );
    });

    it('should throw error if insufficient stock for update', async () => {
      const existingItem = { id: 'item-1', cartId: mockCart.id, productId, quantity: 9 };
      const tx = mockTx();
      (tx.product.findUnique as any).mockResolvedValue({ ...mockProduct, stockQuantity: 10 });
      (tx.cart.upsert as any).mockResolvedValue(mockCart);
      (tx.cartItem.findFirst as any).mockResolvedValue(existingItem);
      (prisma.$transaction as any).mockImplementationOnce(
        async (fn: (arg0: { cart: any; cartItem: any; product: any }) => any) => fn(tx)
      );

      await expect(addCartItem(userId, productId, 2)).rejects.toThrow(
        CartErrors.INSUFFICIENT_STOCK_UPDATE
      );
    });
  });

  describe('updateCartItemQuantity', () => {
    const itemId = 'item-1';
    const userId = 'user-1';
    const newQuantity = 3;
    const mockItem = {
      id: itemId,
      cart: { userId },
      product: { stockQuantity: 10 },
    };
    const updatedItem = { ...mockItem, quantity: newQuantity };

    it('should update quantity successfully', async () => {
      (prisma.cartItem.findUnique as any).mockResolvedValue(mockItem);
      (prisma.cartItem.update as any).mockResolvedValue(updatedItem);

      const result = await updateCartItemQuantity(itemId, userId, newQuantity);

      expect(result).toEqual(updatedItem);
      expect(prisma.cartItem.findUnique).toHaveBeenCalledWith({
        where: { id: itemId },
        include: {
          cart: { select: { userId: true } },
          product: { select: { stockQuantity: true } },
        },
      });
      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: itemId },
        data: { quantity: newQuantity },
        include: { product: { select: expect.any(Object) } },
      });
      expect(logger.info).toHaveBeenCalled();
    });

    it('should return null if item not found', async () => {
      (prisma.cartItem.findUnique as any).mockResolvedValue(null);
      const result = await updateCartItemQuantity(itemId, userId, newQuantity);
      expect(result).toBeNull();
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should return "forbidden" if user does not own the cart', async () => {
      const mockItemWrongUser = { ...mockItem, cart: { userId: 'other-user' } };
      (prisma.cartItem.findUnique as any).mockResolvedValue(mockItemWrongUser);
      const result = await updateCartItemQuantity(itemId, userId, newQuantity);
      expect(result).toBe('forbidden');
    });

    it('should throw error if insufficient stock', async () => {
      (prisma.cartItem.findUnique as any).mockResolvedValue({
        ...mockItem,
        product: { stockQuantity: 1 },
      });
      await expect(updateCartItemQuantity(itemId, userId, 5)).rejects.toThrow(
        CartErrors.INSUFFICIENT_STOCK
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('removeCartItem', () => {
    const itemId = 'item-1';
    const userId = 'user-1';
    const mockItem = { id: itemId, cart: { userId } };

    it('should delete item and return true', async () => {
      (prisma.cartItem.findUnique as any).mockResolvedValue(mockItem);
      (prisma.cartItem.delete as any).mockResolvedValue({});

      const result = await removeCartItem(itemId, userId);

      expect(result).toBe(true);
      expect(prisma.cartItem.findUnique).toHaveBeenCalledWith({
        where: { id: itemId },
        include: { cart: { select: { userId: true } } },
      });
      expect(prisma.cartItem.delete).toHaveBeenCalledWith({ where: { id: itemId } });
      expect(logger.info).toHaveBeenCalled();
    });

    it('should return null if item not found', async () => {
      (prisma.cartItem.findUnique as any).mockResolvedValue(null);
      const result = await removeCartItem(itemId, userId);
      expect(result).toBeNull();
    });

    it('should return "forbidden" if user does not own the cart', async () => {
      const mockItemWrongUser = { ...mockItem, cart: { userId: 'other-user' } };
      (prisma.cartItem.findUnique as any).mockResolvedValue(mockItemWrongUser);
      const result = await removeCartItem(itemId, userId);
      expect(result).toBe('forbidden');
    });
  });

  describe('clearCart', () => {
    const userId = 'user-1';
    const mockCart = { id: 'cart-1' };

    it('should delete all cart items and return true', async () => {
      (prisma.cart.findUnique as any).mockResolvedValue(mockCart);
      (prisma.cartItem.deleteMany as any).mockResolvedValue({ count: 2 });

      const result = await clearCart(userId);

      expect(result).toBe(true);
      expect(prisma.cart.findUnique).toHaveBeenCalledWith({
        where: { userId },
        select: { id: true },
      });
      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: mockCart.id },
      });
      expect(logger.info).toHaveBeenCalled();
    });

    it('should return true if cart does not exist (no-op success)', async () => {
      (prisma.cart.findUnique as any).mockResolvedValue(null);

      const result = await clearCart(userId);

      expect(result).toBe(true);
      expect(prisma.cart.findUnique).toHaveBeenCalledWith({
        where: { userId },
        select: { id: true },
      });
      expect(prisma.cartItem.deleteMany).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();
    });

    it('should throw and log error on database failure', async () => {
      const dbError = new Error('DB connection lost');
      (prisma.cart.findUnique as any).mockRejectedValue(dbError);

      await expect(clearCart(userId)).rejects.toThrow('DB connection lost');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
