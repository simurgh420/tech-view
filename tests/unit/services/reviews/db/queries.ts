// tests/unit/services/reviews/db/queries.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getReviewsByProductSlug,
  getReviewsByProductId,
  getReviewById,
  getAllReviewsAdmin,
  getReviewByIdAdmin,
} from '@/services/reviews/db/queries';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => ({
  default: {
    review: {
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

describe('Reviews DB Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getReviewsByProductSlug', () => {
    const slug = 'test-product';
    const mockReviews = [{ id: 'r1', rating: 5, content: 'Great', user: { name: 'John' } }];

    it('should return reviews for a product slug', async () => {
      (prisma.review.findMany as any).mockResolvedValue(mockReviews);
      const result = await getReviewsByProductSlug(slug);
      expect(prisma.review.findMany).toHaveBeenCalledWith({
        where: { product: { slug } },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: expect.any(Object) } },
      });
      expect(result).toEqual(mockReviews);
      expect(logger.info).toHaveBeenCalledWith(
        'getReviewsByProductSlug success',
        expect.objectContaining({ slug, count: 1 })
      );
    });

    it('should log and throw error on failure', async () => {
      const error = new Error('DB error');
      (prisma.review.findMany as any).mockRejectedValue(error);
      await expect(getReviewsByProductSlug(slug)).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getReviewsByProductId', () => {
    const productId = 'prod-123';
    const mockReviews = [{ id: 'r1', rating: 4 }];

    it('should return reviews for a product ID', async () => {
      (prisma.review.findMany as any).mockResolvedValue(mockReviews);
      const result = await getReviewsByProductId(productId);
      expect(prisma.review.findMany).toHaveBeenCalledWith({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: expect.any(Object) } },
      });
      expect(result).toEqual(mockReviews);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      (prisma.review.findMany as any).mockRejectedValue(new Error('Fail'));
      await expect(getReviewsByProductId(productId)).rejects.toThrow('Fail');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getReviewById', () => {
    const id = 'rev-1';
    const mockReview = { id, authorId: 'user-1' };

    it('should return review with authorId when found', async () => {
      (prisma.review.findUnique as any).mockResolvedValue(mockReview);
      const result = await getReviewById(id);
      expect(prisma.review.findUnique).toHaveBeenCalledWith({
        where: { id },
        select: { id: true, authorId: true },
      });
      expect(result).toEqual(mockReview);
      expect(logger.info).toHaveBeenCalledWith(
        'getReviewById success',
        expect.objectContaining({ id })
      );
    });

    it('should return null when not found', async () => {
      (prisma.review.findUnique as any).mockResolvedValue(null);
      const result = await getReviewById('missing');
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith('getReviewById: not found', expect.any(Object));
    });

    it('should log error on failure', async () => {
      (prisma.review.findUnique as any).mockRejectedValue(new Error('DB fail'));
      await expect(getReviewById(id)).rejects.toThrow('DB fail');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getAllReviewsAdmin', () => {
    const mockReviews = [{ id: 'r1', user: { name: 'Admin' }, product: { title: 'Product' } }];

    it('should return all reviews with user and product details', async () => {
      (prisma.review.findMany as any).mockResolvedValue(mockReviews);
      const result = await getAllReviewsAdmin();
      expect(prisma.review.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, image: true } },
          product: { select: { id: true, slug: true, title: true } },
        },
      });
      expect(result).toEqual(mockReviews);
      expect(logger.info).toHaveBeenCalledWith('getAllReviewsAdmin success', expect.any(Object));
    });
  });

  describe('getReviewByIdAdmin', () => {
    const id = 'rev-1';
    const mockReview = { id, user: { name: 'Admin' }, product: { title: 'P' } };

    it('should return review with details when found', async () => {
      (prisma.review.findUnique as any).mockResolvedValue(mockReview);
      const result = await getReviewByIdAdmin(id);
      expect(prisma.review.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          user: { select: { id: true, name: true, image: true } },
          product: { select: { id: true, slug: true, title: true } },
        },
      });
      expect(result).toEqual(mockReview);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should return null when not found', async () => {
      (prisma.review.findUnique as any).mockResolvedValue(null);
      const result = await getReviewByIdAdmin('missing');
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith('getReviewByIdAdmin: not found', expect.any(Object));
    });
  });
});
