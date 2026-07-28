import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCart, getCartForCheckout } from '@/services/cart/db/queries';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => ({
  default: {
    cart: {
      findUnique: vi.fn(),
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
  const userId = 'user-1';
  const cartId = 'cart-1';
  const mockItems = [
    { id: 'item1', product: { id: 'p1' } },
    { id: 'item2', product: { id: 'p2' } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return items when cart exists', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue({
        id: cartId,
        items: mockItems,
      } as any);

      const result = await getCart(userId);

      expect(prisma.cart.findUnique).toHaveBeenCalledWith({
        where: { userId },
        include: {
          items: {
            orderBy: { createdAt: 'desc' },
            include: { product: { select: expect.any(Object) } },
          },
        },
      });
      expect(result).toEqual(mockItems);
      expect(logger.info).toHaveBeenCalledWith(
        'getCart success',
        expect.objectContaining({ userId, itemCount: 2 })
      );
    });

    it('should return empty array when cart does not exist', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(null);

      const result = await getCart(userId);

      expect(result).toEqual([]);
      expect(logger.info).toHaveBeenCalledWith(
        'getCart: no cart found',
        expect.objectContaining({ userId })
      );
    });

    it('should throw and log error on database failure', async () => {
      const dbError = new Error('DB connection lost');
      vi.mocked(prisma.cart.findUnique).mockRejectedValue(dbError);

      await expect(getCart(userId)).rejects.toThrow('DB connection lost');
      expect(logger.error).toHaveBeenCalledWith(
        'getCart failed',
        expect.objectContaining({ userId, error: 'DB connection lost' })
      );
    });
  });

  describe('getCartForCheckout', () => {
    it('should return cartId and items when cart exists', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue({
        id: cartId,
        items: mockItems,
      } as any);

      const result = await getCartForCheckout(userId);

      expect(prisma.cart.findUnique).toHaveBeenCalledWith({
        where: { userId },
        include: {
          items: {
            orderBy: { createdAt: 'desc' },
            include: { product: { select: expect.any(Object) } },
          },
        },
      });
      expect(result).toEqual({
        cartId,
        items: mockItems,
      });
      expect(logger.info).toHaveBeenCalledWith(
        'getCartForCheckout success',
        expect.objectContaining({ userId, itemCount: 2 })
      );
    });

    it('should return null when cart does not exist', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(null);

      const result = await getCartForCheckout(userId);

      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'getCartForCheckout: no cart found',
        expect.objectContaining({ userId })
      );
    });

    it('should throw and log error on database failure', async () => {
      const dbError = new Error('DB connection lost');
      vi.mocked(prisma.cart.findUnique).mockRejectedValue(dbError);

      await expect(getCartForCheckout(userId)).rejects.toThrow('DB connection lost');
      expect(logger.error).toHaveBeenCalledWith(
        'getCartForCheckout failed',
        expect.objectContaining({ userId, error: 'DB connection lost' })
      );
    });
  });
});
