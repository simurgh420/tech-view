// tests/unit/services/products/db/mutations.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProduct, updateProduct, deleteProduct } from '@/services/products/db/mutations';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';
import { CreateProductInput } from '@/lib/validation/product';
import * as slugCommon from '@/lib/slug-common';
import * as slugServer from '@/lib/server/slug';

// ---------- مــاک‌ها ----------
vi.mock('@/services/db/client', () => ({
  default: {
    product: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    productSpecification: {
      create: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(async callback => callback(prisma)),
  },
}));

vi.mock('@/lib/slug-common', () => ({
  toSlug: vi.fn(),
}));

vi.mock('@/lib/server/slug', () => ({
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
    (slugCommon.toSlug as any).mockImplementation((str: string) =>
      str.toLowerCase().replace(/\s+/g, '-')
    );
    (slugServer.generateUniqueSlug as any).mockResolvedValue((base: string) => base);
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
      specifications: [],
    };

    it('should create product and its specifications in a transaction', async () => {
      (prisma.product.create as any).mockResolvedValue(mockCreated);
      (prisma.product.findUniqueOrThrow as any).mockResolvedValue(mockCreated);
      (prisma.productSpecification.createMany as any).mockResolvedValue({ count: 2 });

      const result = await createProduct(input);

      expect(prisma.$transaction).toHaveBeenCalled();

      // بررسی create با select به جای include
      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'New Product',
            slug: 'new-product',
          }),
          select: { id: true }, // کد واقعی از select استفاده می‌کند
        })
      );

      // بررسی createMany با دو آیتم
      expect(prisma.productSpecification.createMany).toHaveBeenCalledTimes(1);
      expect(prisma.productSpecification.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            productId: 'p1',
            key: 'رنگ',
            value: 'قرمز',
            groupName: 'گروه تست',
          }),
          expect.objectContaining({
            productId: 'p1',
            key: 'حافظه',
            value: '256GB',
            groupName: 'گروه تست',
          }),
        ]),
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
      slug: 'new-slug',
      specifications: [],
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
      (prisma.product.findUnique as any).mockResolvedValueOnce(existing);
      (prisma.product.findUniqueOrThrow as any).mockResolvedValueOnce(updated);

      (prisma.product.update as any).mockResolvedValue(updated);
      (prisma.productSpecification.deleteMany as any).mockResolvedValue({ count: 0 });
      (prisma.productSpecification.createMany as any).mockResolvedValue({ count: 1 });

      const updateData = {
        title: 'New',
        specifications: [{ group: 'گروه', items: [{ label: 'رنگ', value: 'آبی' }] }],
      };

      const result = await updateProduct(slug, updateData);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.productSpecification.deleteMany).toHaveBeenCalledWith({
        where: { productId: existing.id },
      });
      expect(prisma.productSpecification.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            productId: existing.id,
            key: 'رنگ',
            value: 'آبی',
            groupName: 'گروه',
          }),
        ]),
      });
      expect(result).toEqual(expect.objectContaining({ title: 'New' }));
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('deleteProduct', () => {
    it('should return false if not found', async () => {
      (prisma.product.findUnique as any).mockResolvedValueOnce(null);

      const result = await deleteProduct('missing');

      expect(result).toBe(false);
      expect(logger.info).toHaveBeenCalled();
      expect(prisma.product.delete).not.toHaveBeenCalled();
    });

    it('should delete and return true', async () => {
      (prisma.product.findUnique as any).mockResolvedValue({ id: 'p1' });
      (prisma.product.delete as any).mockResolvedValue({});

      const result = await deleteProduct('test');

      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalled();
      expect(prisma.product.delete).toHaveBeenCalledWith({ where: { slug: 'test' } });
    });
  });
});
