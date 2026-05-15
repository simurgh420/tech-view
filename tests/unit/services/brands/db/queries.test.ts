import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBrands, getActiveBrands, getBrandBySlug } from '@/services/brands/db/queries';
import prisma from '@/services/db/client';

// موک کردن prisma قبل از import توابع
vi.mock('@/services/db/client', () => ({
  default: {
    brand: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('Brand DB Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBrands', () => {
    it('should return all brands sorted by createdAt desc', async () => {
      const mockBrands = [
        { id: '1', name: 'Brand A', createdAt: new Date('2024-01-01'), isActive: true },
        { id: '2', name: 'Brand B', createdAt: new Date('2024-01-02'), isActive: false },
      ];
      (prisma.brand.findMany as any).mockResolvedValue(mockBrands);

      const result = await getBrands();

      expect(prisma.brand.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockBrands);
    });

    it('should return empty array when no brands exist', async () => {
      (prisma.brand.findMany as any).mockResolvedValue([]);
      const result = await getBrands();
      expect(result).toEqual([]);
    });
  });

  describe('getActiveBrands', () => {
    it('should return only active brands sorted by createdAt desc', async () => {
      const mockActiveBrands = [
        { id: '1', name: 'Active Brand', createdAt: new Date('2024-01-01'), isActive: true },
      ];
      (prisma.brand.findMany as any).mockResolvedValue(mockActiveBrands);

      const result = await getActiveBrands();

      expect(prisma.brand.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockActiveBrands);
    });

    it('should return empty array if no active brands', async () => {
      (prisma.brand.findMany as any).mockResolvedValue([]);
      const result = await getActiveBrands();
      expect(result).toEqual([]);
    });
  });

  describe('getBrandBySlug', () => {
    const mockBrandWithProducts = {
      id: '1',
      name: 'Test Brand',
      slug: 'test-brand',
      logo: 'https://example.com/logo.png',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      products: [
        { id: 'p1', title: 'Product 1', createdAt: new Date('2024-01-02') },
        { id: 'p2', title: 'Product 2', createdAt: new Date('2024-01-01') },
      ],
    };

    it('should return brand with products when found', async () => {
      (prisma.brand.findUnique as any).mockResolvedValue(mockBrandWithProducts);

      const result = await getBrandBySlug('test-brand');

      expect(prisma.brand.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-brand' },
        include: {
          products: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      expect(result).toEqual(mockBrandWithProducts);
      expect(result?.products).toHaveLength(2);
      expect(result?.products[0].title).toBe('Product 1'); // name → title
    });

    it('should return null when brand not found', async () => {
      (prisma.brand.findUnique as any).mockResolvedValue(null);
      const result = await getBrandBySlug('non-existent');
      expect(result).toBeNull();
      expect(prisma.brand.findUnique).toHaveBeenCalledWith({
        where: { slug: 'non-existent' },
        include: { products: { orderBy: { createdAt: 'desc' } } },
      });
    });

    it('should return brand with empty products array when brand has no products', async () => {
      const brandWithoutProducts = {
        ...mockBrandWithProducts,
        products: [],
      };
      (prisma.brand.findUnique as any).mockResolvedValue(brandWithoutProducts);

      const result = await getBrandBySlug('empty-brand');
      expect(result?.products).toEqual([]);
    });
  });
});
