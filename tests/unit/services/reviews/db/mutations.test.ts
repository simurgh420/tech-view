import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReview, updateReview, deleteReview } from '@/services/reviews/db/mutations';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => {
  const tx = {
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },

    review: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
    },
  };

  return {
    default: {
      ...tx,

      $transaction: vi.fn(async (callback: any) => {
        return callback(tx);
      }),
    },
  };
});

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Reviews DB Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (prisma.review.aggregate as any).mockResolvedValue({
      _avg: { rating: 5 },
      _count: { rating: 1 },
    });

    (prisma.product.update as any).mockResolvedValue({});
  });

  describe('createReview', () => {
    const input = {
      productSlug: 'test-product',
      authorId: 'user-1',
      rating: 5,
      title: 'Great',
      content: 'This is a valid review with enough length.',
    };

    const mockProduct = {
      id: 'prod-1',
    };

    const mockReview = {
      id: 'rev-1',
      ...input,
      productId: mockProduct.id,
    };

    it('should create review successfully', async () => {
      (prisma.product.findUnique as any).mockResolvedValue(mockProduct);
      (prisma.review.create as any).mockResolvedValue(mockReview);

      const result = await createReview(input);

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: input.productSlug },
        select: { id: true },
      });

      expect(prisma.review.create).toHaveBeenCalled();

      expect(result).toEqual(mockReview);

      expect(logger.info).toHaveBeenCalled();
    });

    it('should throw error if product not found', async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);

      await expect(createReview(input)).rejects.toThrow('Product not found');

      expect(logger.error).toHaveBeenCalled();
      expect(prisma.review.create).not.toHaveBeenCalled();
    });

    it('should log error on database failure', async () => {
      (prisma.product.findUnique as any).mockRejectedValue(new Error('DB down'));

      await expect(createReview(input)).rejects.toThrow('DB down');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateReview', () => {
    const id = 'rev-1';

    const data = {
      rating: 4,
      content: 'Updated content',
    };

    const updatedReview = {
      id,
      ...data,
      title: null,
      productId: 'prod-1',
    };

    it('should update review successfully', async () => {
      (prisma.review.update as any).mockResolvedValue(updatedReview);

      const result = await updateReview(id, data);

      expect(prisma.review.update).toHaveBeenCalled();

      expect(result).toEqual(updatedReview);

      expect(logger.info).toHaveBeenCalled();
    });

    it('should log error on failure', async () => {
      (prisma.review.update as any).mockRejectedValue(new Error('Update fail'));

      await expect(updateReview(id, data)).rejects.toThrow('Update fail');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteReview', () => {
    const id = 'rev-1';

    it('should delete review and return success true', async () => {
      (prisma.review.delete as any).mockResolvedValue({
        id,
        productId: 'prod-1',
      });

      const result = await deleteReview(id);

      expect(prisma.review.delete).toHaveBeenCalledWith({
        where: { id },
      });

      expect(result).toEqual({
        success: true,
      });

      expect(logger.info).toHaveBeenCalled();
    });

    it('should log error on failure', async () => {
      (prisma.review.delete as any).mockRejectedValue(new Error('Delete fail'));

      await expect(deleteReview(id)).rejects.toThrow('Delete fail');

      expect(logger.error).toHaveBeenCalled();
    });
  });
});
