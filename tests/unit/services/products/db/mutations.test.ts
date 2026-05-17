// tests/unit/services/products/db/mutations.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProduct, updateProduct, deleteProduct } from '@/services/products/db/mutations';
import prisma from '@/services/db/client';
import * as slugUtils from '@/lib/slug';
import { logger } from '@/lib/logger';
import { CreateProductInput } from '@/lib/validation/product';

vi.mock('@/services/db/client', () => ({
  default: {
    product: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/slug', () => ({
  toSlug: vi.fn(),
  generateUniqueSlug: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Products DB Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (slugUtils.toSlug as any).mockImplementation((str: string) =>
      str.toLowerCase().replace(/\s+/g, '-')
    );
    (slugUtils.generateUniqueSlug as any).mockImplementation(async (base: string) => base);
  });

  describe('createProduct', () => {
    // ✅ اضافه کردن تمام فیلدهای مورد نیاز (حتی با مقدار پیش‌فرض)
    const input: CreateProductInput = {
      title: 'New Product',
      description: 'This is a long description that exceeds twenty characters.',
      price: 1000,
      brandSlug: 'nike',
      categorySlug: 'shoes',
      stockQuantity: 10,
      images: [],
      keyFeatures: [],
      colors: [],
      variants: [],
      specifications: [],
      isFeatured: false,
      isNew: true,
      status: 'DRAFT',
      subCategorySlug: null,
      thumbnail: null,
      discountPrice: null,
      slug: undefined,
      publishedAt: undefined,
    };
    const now = new Date();
    const mockCreated = {
      id: 'p1',
      ...input,
      slug: 'new-product',
      price: 1000,
      createdAt: now,
      updatedAt: now,
      brand: { slug: 'nike' },
      category: { slug: 'shoes' },
      subCategory: null,
    };

    it('should create product and return formatted', async () => {
      (prisma.product.create as any).mockResolvedValue(mockCreated);
      const result = await createProduct(input);
      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: 'New Product', slug: 'new-product' }),
          include: { brand: true, category: true, subCategory: true },
        })
      );
      expect(result).toEqual(expect.objectContaining({ id: 'p1', title: 'New Product' }));
      expect(logger.info).toHaveBeenCalled();
    });

    it('should throw error for duplicate slug', async () => {
      const error = { code: 'P2002', message: 'Unique constraint' };
      (prisma.product.create as any).mockRejectedValue(error);
      await expect(createProduct(input)).rejects.toThrow('already exists');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateProduct', () => {
    const slug = 'test-product';
    const now = new Date();
    const existing = {
      id: 'p1',
      slug,
      title: 'Old',
      price: 1000,
      discountPrice: null,
      createdAt: now,
      updatedAt: now,
      brand: { slug: 'nike' },
      category: { slug: 'shoes' },
      subCategory: null,
    };
    const updated = { ...existing, title: 'New' };

    it('should return null if product not found', async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);
      const result = await updateProduct(slug, { title: 'New' });
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'updateProduct: product not found',
        expect.any(Object)
      );
    });

    it('should update product', async () => {
      (prisma.product.findUnique as any).mockResolvedValue(existing);
      (prisma.product.update as any).mockResolvedValue(updated);
      const result = await updateProduct(slug, { title: 'New' });
      expect(prisma.product.update).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ title: 'New' }));
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('deleteProduct', () => {
    it('should return false if not found', async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);
      const result = await deleteProduct('missing');
      expect(result).toBe(false);
      expect(logger.info).toHaveBeenCalled();
    });
    it('should delete and return true', async () => {
      (prisma.product.findUnique as any).mockResolvedValue({ id: 'p1' });
      (prisma.product.delete as any).mockResolvedValue({});
      const result = await deleteProduct('test');
      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalled();
    });
  });
});
