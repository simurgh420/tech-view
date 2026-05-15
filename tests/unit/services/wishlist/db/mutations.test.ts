import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  addToWishlist,
  removeFromWishlist,
  deleteWishlistItemByUserAndProduct,
  clearWishlist,
} from '@/services/wishlist/db/mutations';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => ({
  default: {
    wishlistItem: {
      upsert: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Wishlist DB Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addToWishlist', () => {
    const userId = 'u1';
    const productId = 'p1';
    const mockItem = { id: 'w1', userId, productId, product: { title: 'Test' } };

    it('should upsert and return wishlist item', async () => {
      (prisma.wishlistItem.upsert as any).mockResolvedValue(mockItem);
      const result = await addToWishlist(userId, productId);
      expect(prisma.wishlistItem.upsert).toHaveBeenCalledWith({
        where: { userId_productId: { userId, productId } },
        update: {},
        create: { userId, productId },
        include: { product: { select: expect.any(Object) } },
      });
      expect(result).toEqual(mockItem);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should log error and rethrow', async () => {
      const error = new Error('DB fail');
      (prisma.wishlistItem.upsert as any).mockRejectedValue(error);
      await expect(addToWishlist(userId, productId)).rejects.toThrow('DB fail');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('removeFromWishlist', () => {
    const id = 'w1';

    it('should delete and return success', async () => {
      (prisma.wishlistItem.delete as any).mockResolvedValue({});
      const result = await removeFromWishlist(id);
      expect(prisma.wishlistItem.delete).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual({ success: true });
      expect(logger.info).toHaveBeenCalled();
    });

    it('should log error and rethrow', async () => {
      const error = new Error('Not found');
      (prisma.wishlistItem.delete as any).mockRejectedValue(error);
      await expect(removeFromWishlist(id)).rejects.toThrow('Not found');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteWishlistItemByUserAndProduct', () => {
    const userId = 'u1';
    const productId = 'p1';

    it('should delete by composite key and return success', async () => {
      (prisma.wishlistItem.delete as any).mockResolvedValue({});
      const result = await deleteWishlistItemByUserAndProduct(userId, productId);
      expect(prisma.wishlistItem.delete).toHaveBeenCalledWith({
        where: { userId_productId: { userId, productId } },
      });
      expect(result).toEqual({ success: true });
      expect(logger.info).toHaveBeenCalled();
    });

    it('should log error and rethrow', async () => {
      const error = new Error('FK constraint');
      (prisma.wishlistItem.delete as any).mockRejectedValue(error);
      await expect(deleteWishlistItemByUserAndProduct(userId, productId)).rejects.toThrow(
        'FK constraint'
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('clearWishlist', () => {
    const userId = 'u1';

    it('should delete many and return success', async () => {
      (prisma.wishlistItem.deleteMany as any).mockResolvedValue({ count: 3 });
      const result = await clearWishlist(userId);
      expect(prisma.wishlistItem.deleteMany).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toEqual({ success: true });
      expect(logger.info).toHaveBeenCalled();
    });

    it('should log error and rethrow', async () => {
      const error = new Error('DB down');
      (prisma.wishlistItem.deleteMany as any).mockRejectedValue(error);
      await expect(clearWishlist(userId)).rejects.toThrow('DB down');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
