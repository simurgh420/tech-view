import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCategories, getCategoryBySlug } from '@/services/categories/db/queries';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => ({
  default: {
    category: {
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

describe('Category DB Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return all categories ordered by order asc', async () => {
      const mockCategories = [
        { id: '1', title: 'Electronics', order: 1 },
        { id: '2', title: 'Clothing', order: 2 },
      ];
      (prisma.category.findMany as any).mockResolvedValue(mockCategories);
      const result = await getCategories();
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { order: 'asc' },
      });
      expect(result).toEqual(mockCategories);
      expect(logger.info).toHaveBeenCalledWith(
        'getCategories success',
        expect.objectContaining({ count: 2 })
      );
    });

    it('should log error and throw on failure', async () => {
      const dbError = new Error('DB connection lost');
      (prisma.category.findMany as any).mockRejectedValue(dbError);
      await expect(getCategories()).rejects.toThrow('DB connection lost');
      expect(logger.error).toHaveBeenCalledWith(
        'getCategories failed',
        expect.objectContaining({ error: 'DB connection lost' })
      );
    });
  });

  describe('getCategoryBySlug', () => {
    const mockCategory = {
      id: '1',
      title: 'Electronics',
      slug: 'electronics',
      products: [{ id: 'p1' }, { id: 'p2' }],
      children: [{ id: 'c1' }],
    };

    it('should return category with products and children when found', async () => {
      (prisma.category.findUnique as any).mockResolvedValue(mockCategory);
      const result = await getCategoryBySlug('electronics');
      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { slug: 'electronics' },
        include: {
          products: { orderBy: { createdAt: 'desc' } },
          children: true,
        },
      });
      expect(result).toEqual(mockCategory);
      expect(logger.info).toHaveBeenCalledWith(
        'getCategoryBySlug success',
        expect.objectContaining({ slug: 'electronics', productCount: 2, childrenCount: 1 })
      );
    });

    it('should return null when category not found', async () => {
      (prisma.category.findUnique as any).mockResolvedValue(null);
      const result = await getCategoryBySlug('missing');
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'getCategoryBySlug: not found',
        expect.objectContaining({ slug: 'missing' })
      );
    });

    it('should log error and throw on failure', async () => {
      const dbError = new Error('Unique constraint error');
      (prisma.category.findUnique as any).mockRejectedValue(dbError);
      await expect(getCategoryBySlug('test')).rejects.toThrow('Unique constraint error');
      expect(logger.error).toHaveBeenCalledWith(
        'getCategoryBySlug failed',
        expect.objectContaining({ slug: 'test', error: 'Unique constraint error' })
      );
    });
  });
});
