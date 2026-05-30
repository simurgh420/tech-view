import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getWishlist,
  getWishlistItemById,
  isProductInWishlist,
  getAllWishlistItems,
} from '@/services/wishlist/db/queries';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => ({
  default: {
    wishlistItem: {
      findMany: vi.fn(),
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

describe('Wishlist DB Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWishlist', () => {
    const userId = 'user-1';
    const mockItems = [{ id: 'w1', product: { title: 'Product 1' } }];

    it('should return wishlist items for user', async () => {
      (prisma.wishlistItem.findMany as any).mockResolvedValue(mockItems);
      const result = await getWishlist(userId);
      expect(prisma.wishlistItem.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { product: { select: expect.any(Object) } },
      });
      expect(result).toEqual(mockItems);
      expect(logger.info).toHaveBeenCalledWith(
        'getWishlist success',
        expect.objectContaining({ userId, count: 1 })
      );
    });

    it('should log error and throw', async () => {
      const error = new Error('DB fail');
      (prisma.wishlistItem.findMany as any).mockRejectedValue(error);
      await expect(getWishlist(userId)).rejects.toThrow('DB fail');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getWishlistItemById', () => {
    const id = 'w1';
    const mockItem = { id, userId: 'u1' };

    it('should return item when found', async () => {
      (prisma.wishlistItem.findUnique as any).mockResolvedValue(mockItem);
      const result = await getWishlistItemById(id);
      expect(prisma.wishlistItem.findUnique).toHaveBeenCalledWith({
        where: { id },
        select: { id: true, userId: true },
      });
      expect(result).toEqual(mockItem);
      expect(logger.info).toHaveBeenCalledWith(
        'getWishlistItemById success',
        expect.objectContaining({ id })
      );
    });

    it('should return null when not found', async () => {
      (prisma.wishlistItem.findUnique as any).mockResolvedValue(null);
      const result = await getWishlistItemById('missing');
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'getWishlistItemById: not found',
        expect.objectContaining({ id: 'missing' })
      );
    });
  });

  describe('isProductInWishlist', () => {
    const userId = 'u1';
    const productId = 'p1';

    it('should return true if product exists', async () => {
      (prisma.wishlistItem.findUnique as any).mockResolvedValue({ id: 'w1' });
      const result = await isProductInWishlist(userId, productId);
      expect(result).toBe(true);
      expect(prisma.wishlistItem.findUnique).toHaveBeenCalledWith({
        where: { userId_productId: { userId, productId } },
      });
    });

    it('should return false if product not in wishlist', async () => {
      (prisma.wishlistItem.findUnique as any).mockResolvedValue(null);
      const result = await isProductInWishlist(userId, productId);
      expect(result).toBe(false);
    });
  });

  describe('getAllWishlistItems', () => {
    const mockItems = [
      { id: 'w1', user: { name: 'John' }, product: { title: 'P1' } },
    ];

    it('should return all items with user and product selects', async () => {
      (prisma.wishlistItem.findMany as any).mockResolvedValue(mockItems);
      const result = await getAllWishlistItems();
      expect(prisma.wishlistItem.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, title: true, slug: true } },
        },
      });
      expect(result).toEqual(mockItems);
      expect(logger.info).toHaveBeenCalledWith(
        'getAllWishlistItems success',
        expect.objectContaining({ count: 1 })
      );
    });

    it('should handle empty result', async () => {
      (prisma.wishlistItem.findMany as any).mockResolvedValue([]);
      const result = await getAllWishlistItems();
      expect(result).toEqual([]);
      expect(logger.info).toHaveBeenCalledWith(
        'getAllWishlistItems success',
        expect.objectContaining({ count: 0 })
      );
    });
  });
});
