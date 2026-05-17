// tests/unit/services/products/db/mutations.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProduct, updateProduct, deleteProduct } from '@/services/products/db/mutations';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';
import { CreateProductInput } from '@/lib/validation/product';
import * as slugCommon from '@/lib/slug-common';
import * as slugServer from '@/lib/server/slug';
// Mock Prisma client
vi.mock('@/services/db/client', () => ({
  default: {
    product: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    productSpecification: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(callback => callback(prisma)), // مهم: اینجا prisma را به عنوان tx استفاده کن
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
    vi.spyOn(slugCommon, 'toSlug').mockImplementation((str: string) =>
      str.toLowerCase().replace(/\s+/g, '-')
    );  
    vi.spyOn(slugServer, 'generateUniqueSlug').mockImplementation(async (base: string) => base);
  });

  describe('createProduct', () => {
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
      specifications: [
        {
          group: 'گروه تست',
          items: [
            { label: 'رنگ', value: 'قرمز' },
            { label: 'حافظه', value: '256GB' },
          ],
        },
      ],
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
      title: input.title,
      slug: 'new-product',
      description: input.description,
      price: 1000,
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
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
      brand: { slug: 'nike' },
      category: { slug: 'shoes' },
      subCategory: null,
    };

    it('should create product and its specifications in a transaction', async () => {
      (prisma.product.create as any).mockResolvedValue(mockCreated);
      const result = await createProduct(input);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: 'New Product', slug: 'new-product' }),
          include: { brand: true, category: true, subCategory: true },
        })
      );
      // بررسی اینکه دو بار productSpecification.create فراخوانی شده باشد
      expect(prisma.productSpecification.create).toHaveBeenCalledTimes(2);
      expect(prisma.productSpecification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productId: 'p1',
          key: 'رنگ',
          value: 'قرمز',
          groupName: 'گروه تست',
        }),
      });
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
      brand: { slug: 'nike', name: 'Nike' },
      category: { slug: 'shoes', title: 'Shoes' },
      subCategory: null,
      specifications: [],
    };
    const updated = {
      ...existing,
      title: 'New',
      updatedAt: now,
    };

    it('should return null if product not found', async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);
      const result = await updateProduct(slug, { title: 'New' });
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'updateProduct: product not found',
        expect.any(Object)
      );
    });

    it('should update product and handle specifications', async () => {
      // اولین فراخوانی findUnique: برای یافتن محصول موجود
      (prisma.product.findUnique as any).mockResolvedValueOnce(existing);
      // دومین فراخوانی findUnique: در انتهای تراکنش برای برگرداندن محصول به‌روزشده
      (prisma.product.findUnique as any).mockResolvedValueOnce(updated);
      (prisma.product.update as any).mockResolvedValue(updated);
      (prisma.productSpecification.deleteMany as any).mockResolvedValue({ count: 0 });
      (prisma.productSpecification.create as any).mockResolvedValue({});

      const updateData = {
        title: 'New',
        specifications: [{ group: 'گروه', items: [{ label: 'رنگ', value: 'آبی' }] }],
      };
      const result = await updateProduct(slug, updateData);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.productSpecification.deleteMany).toHaveBeenCalledWith({
        where: { productId: existing.id },
      });
      expect(prisma.productSpecification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productId: existing.id,
          key: 'رنگ',
          value: 'آبی',
          groupName: 'گروه',
        }),
      });
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
