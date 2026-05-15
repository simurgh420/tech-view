import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCart, getCartItems } from '@/services/cart/db/queries';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => ({
  default: {
    cart: {
      findUnique: vi.fn(),
    },
    cartItem: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Cart DB Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCart', () => {
    const userId = 'user-1';
    const mockCart = { id: 'cart-1' };
    const mockItems = [
      { id: 'item1', product: { id: 'p1' } },
      { id: 'item2', product: { id: 'p2' } },
    ];

    it('should return items when cart exists', async () => {
      (prisma.cart.findUnique as any).mockResolvedValue(mockCart);
      (prisma.cartItem.findMany as any).mockResolvedValue(mockItems);

      const result = await getCart(userId);

      expect(prisma.cart.findUnique).toHaveBeenCalledWith({
        where: { userId },
        select: { id: true },
      });
      expect(prisma.cartItem.findMany).toHaveBeenCalledWith({
        where: { cartId: mockCart.id },
        orderBy: { createdAt: 'desc' },
        include: { product: { select: expect.any(Object) } },
      });
      expect(result).toEqual(mockItems);
      expect(logger.info).toHaveBeenCalledTimes(2);
    });

    it('should return empty array when cart does not exist', async () => {
      (prisma.cart.findUnique as any).mockResolvedValue(null);

      const result = await getCart(userId);

      expect(result).toEqual([]);
      expect(prisma.cartItem.findMany).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        'getCart: no cart found',
        expect.objectContaining({ userId })
      );
    });

    it('should throw and log error on database failure', async () => {
      const dbError = new Error('DB connection lost');
      (prisma.cart.findUnique as any).mockRejectedValue(dbError);

      await expect(getCart(userId)).rejects.toThrow('DB connection lost');
      expect(logger.error).toHaveBeenCalledWith(
        'getCart failed',
        expect.objectContaining({ userId, error: 'DB connection lost' })
      );
    });
  });

  describe('getCartItems', () => {
    const cartId = 'cart-1';
    const mockItems = [
      { id: 'item1', product: { id: 'p1' } },
      { id: 'item2', product: { id: 'p2' } },
    ];

    it('should return items for given cartId', async () => {
      (prisma.cartItem.findMany as any).mockResolvedValue(mockItems);

      const result = await getCartItems(cartId);

      expect(prisma.cartItem.findMany).toHaveBeenCalledWith({
        where: { cartId },
        orderBy: { createdAt: 'desc' },
        include: { product: { select: expect.any(Object) } },
      });
      expect(result).toEqual(mockItems);
      expect(logger.info).toHaveBeenCalledWith(
        'getCartItems success',
        expect.objectContaining({ cartId, itemCount: 2 })
      );
    });

    it('should return empty array when no items found', async () => {
      (prisma.cartItem.findMany as any).mockResolvedValue([]);

      const result = await getCartItems(cartId);

      expect(result).toEqual([]);
      expect(logger.info).toHaveBeenCalledWith(
        'getCartItems success',
        expect.objectContaining({ cartId, itemCount: 0 })
      );
    });

    it('should throw and log error on database failure', async () => {
      const dbError = new Error('DB error');
      (prisma.cartItem.findMany as any).mockRejectedValue(dbError);

      await expect(getCartItems(cartId)).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalledWith(
        'getCartItems failed',
        expect.objectContaining({ cartId, error: 'DB error' })
      );
    });
  });
});
