import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getProducts,
  getProductBySlug,
  getProductsByBrand,
  getProductsByCategory,
  getFeaturedProducts,
  getFilteredProducts,
} from '@/services/products/db/queries';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => ({
  default: {
    product: {
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

describe('Products DB Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return all products with includes', async () => {
      const mockProducts = [{ id: 'p1', title: 'Product' }];
      (prisma.product.findMany as any).mockResolvedValue(mockProducts);
      const result = await getProducts();
      expect(result).toEqual(mockProducts);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: expect.objectContaining({
          specifications: true, // اضافه شد
        }),
      });
      expect(logger.info).toHaveBeenCalled();
    });
    it('should log error and throw', async () => {
      (prisma.product.findMany as any).mockRejectedValue(new Error('DB fail'));
      await expect(getProducts()).rejects.toThrow('DB fail');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getProductBySlug', () => {
    it('should return product when found', async () => {
      const mockProduct = { id: 'p1', slug: 'test' };
      (prisma.product.findUnique as any).mockResolvedValue(mockProduct);
      const result = await getProductBySlug('test');
      expect(result).toEqual(mockProduct);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test' },
        include: expect.objectContaining({
          specifications: true,
        }),
      });
      expect(logger.info).toHaveBeenCalled();
    });
    it('should return null when not found', async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);
      const result = await getProductBySlug('missing');
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith('getProductBySlug: not found', expect.any(Object));
    });
  });

  describe('getProductsByBrand', () => {
    it('should return products by brand slug', async () => {
      const mockProducts = [{ id: 'p1', brand: { slug: 'nike' } }];
      (prisma.product.findMany as any).mockResolvedValue(mockProducts);
      const result = await getProductsByBrand('nike');
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { brand: { slug: 'nike' } },
        orderBy: { createdAt: 'desc' },
        include: { brand: true, specifications: true },
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products by category slug', async () => {
      const mockProducts = [{ id: 'p1', category: { slug: 'shoes' } }];
      (prisma.product.findMany as any).mockResolvedValue(mockProducts);
      const result = await getProductsByCategory('shoes');
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { category: { slug: 'shoes' } },
        orderBy: { createdAt: 'desc' },
        include: { category: true, specifications: true },
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getFeaturedProducts', () => {
    it('should return featured published products', async () => {
      const mockProducts = [{ id: 'p1', isFeatured: true, status: 'PUBLISHED' }];
      (prisma.product.findMany as any).mockResolvedValue(mockProducts);
      const result = await getFeaturedProducts();
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { isFeatured: true, status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        include: expect.objectContaining({
          specifications: true,
        }),
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getFilteredProducts', () => {
    it('should apply brand filter', async () => {
      (prisma.product.findMany as any).mockResolvedValue([]);
      await getFilteredProducts({ brandSlug: 'nike' });
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            brand: { slug: { equals: 'nike', mode: 'insensitive' } },
          }),
        })
      );
    });
    it('should apply price range', async () => {
      await getFilteredProducts({ minPrice: 100, maxPrice: 500 });
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ price: { gte: 100, lte: 500 } }),
        })
      );
    });
    it('should apply search query', async () => {
      await getFilteredProducts({ q: 'phone' });
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'phone', mode: 'insensitive' } },
              { description: { contains: 'phone', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });
    it('should apply sorting price-asc', async () => {
      await getFilteredProducts({ sort: 'price-asc' });
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'asc' },
        })
      );
    });
    it('should apply pagination', async () => {
      await getFilteredProducts({ page: 2, perPage: 10 });
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    // ✅ تست جدید برای فیلتر مشخصات (specs)
    it('should apply specs filter using specifications.some', async () => {
      (prisma.product.findMany as any).mockResolvedValue([]);
      await getFilteredProducts({
        specs: { color: 'red', ram: '8GB' },
      });
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              { specifications: { some: { key: 'color', value: 'red' } } },
              { specifications: { some: { key: 'ram', value: '8GB' } } },
            ],
          }),
        })
      );
    });
  });
});
