// tests/unit/services/products/db/queries.test.ts
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
import { productIncludes, productWithReviews } from '@/services/products/productIncludes';

// ---------- مــاک‌ها ----------
vi.mock('@/services/db/client', () => ({
  default: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// ---------- Helper: Mock Product ----------
function createMockProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'p1',
    slug: 'test',
    title: 'محصول تست',
    description: 'توضیحات تست',
    price: 150000,
    discountPrice: null,
    discountPercentage: null,
    isDiscounted: false,
    isFeatured: false,
    isNew: true,
    stockQuantity: 10,
    thumbnail: null,
    images: [],
    keyFeatures: [],
    colors: [],
    variants: [],
    specifications: [],
    status: 'PUBLISHED',
    rating: null,
    reviewCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    publishedAt: new Date('2024-01-01'),
    brand: { id: 'b1', name: 'Nike', slug: 'nike' },
    category: { id: 'c1', title: 'کفش', slug: 'shoes' },
    subCategory: null,
    ...overrides,
  };
}

describe('Products DB Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------
  // getProducts
  // -----------------------------------------------------
  describe('getProducts', () => {
    it('should return formatted products with includes', async () => {
      const mockProducts = [createMockProduct()];
      (prisma.product.findMany as any).mockResolvedValue(mockProducts);

      const result = await getProducts();

      expect(result[0].id).toBe('p1');
      expect(result[0].price).toBe('150000');
      expect(result[0].createdAt).toBe('2024-01-01T00:00:00.000Z');

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: productIncludes,
      });

      expect(logger.info).toHaveBeenCalled();
    });

    it('should log error and throw', async () => {
      (prisma.product.findMany as any).mockRejectedValue(new Error('DB fail'));

      await expect(getProducts()).rejects.toThrow('DB fail');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------
  // getProductBySlug
  // -----------------------------------------------------
  describe('getProductBySlug', () => {
    it('should return formatted product when found', async () => {
      const mockProduct = createMockProduct();
      (prisma.product.findUnique as any).mockResolvedValue(mockProduct);

      const result = await getProductBySlug('test');

      expect(result?.id).toBe('p1');
      expect(result?.price).toBe('150000');
      expect(result?.createdAt).toBe('2024-01-01T00:00:00.000Z');

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test' },
        include: productWithReviews,
      });

      expect(logger.info).toHaveBeenCalled();
    });

    it('should return null when not found', async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);

      const result = await getProductBySlug('missing');

      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------
  // getProductsByBrand
  // -----------------------------------------------------
  describe('getProductsByBrand', () => {
    it('should return formatted products by brand slug', async () => {
      const mockProducts = [createMockProduct({ brand: { slug: 'nike' } })];
      (prisma.product.findMany as any).mockResolvedValue(mockProducts);

      const result = await getProductsByBrand('nike');

      expect(result[0].brand!.slug).toBe('nike');

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { brand: { slug: 'nike' } },
        orderBy: { createdAt: 'desc' },
        include: productIncludes, // اصلاح: استفاده از productIncludes به‌جای شئ ساده
      });
    });
  });

  // -----------------------------------------------------
  // getProductsByCategory
  // -----------------------------------------------------
  describe('getProductsByCategory', () => {
    it('should return formatted products by category slug', async () => {
      const mockProducts = [createMockProduct({ category: { slug: 'shoes' } })];
      (prisma.product.findMany as any).mockResolvedValue(mockProducts);

      const result = await getProductsByCategory('shoes');

      expect(result[0].category!.slug).toBe('shoes');

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { category: { slug: 'shoes' } },
        orderBy: { createdAt: 'desc' },
        include: productIncludes, // اصلاح: استفاده از productIncludes
      });
    });
  });

  // -----------------------------------------------------
  // getFeaturedProducts
  // -----------------------------------------------------
  describe('getFeaturedProducts', () => {
    it('should return formatted featured products', async () => {
      const mockProducts = [createMockProduct({ isFeatured: true, status: 'PUBLISHED' })];
      (prisma.product.findMany as any).mockResolvedValue(mockProducts);

      const result = await getFeaturedProducts();

      expect(result[0].isFeatured).toBe(true);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { isFeatured: true, status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        include: productIncludes,
      });

      expect(logger.info).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------
  // getFilteredProducts
  // -----------------------------------------------------
  describe('getFilteredProducts', () => {
    beforeEach(() => {
      (prisma.product.findMany as any).mockResolvedValue([]);
      (prisma.product.count as any).mockResolvedValue(0);
    });

    it('should apply brand filter', async () => {
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

    it('should apply specs filter using specifications.some', async () => {
      await getFilteredProducts({
        specs: {
          color: 'red',
          ram: '8GB',
        },
      });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              {
                specifications: {
                  some: {
                    attribute: {
                      key: 'color',
                    },
                    value: 'red',
                  },
                },
              },
              {
                specifications: {
                  some: {
                    attribute: {
                      key: 'ram',
                    },
                    value: '8GB',
                  },
                },
              },
            ],
          }),
        })
      );
    });
  });
});
