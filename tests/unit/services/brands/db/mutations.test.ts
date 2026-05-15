// tests/unit/services/brands/db/mutations.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBrand, updateBrandBySlug, deleteBrandBySlug } from '@/services/brands/db/mutations';
import prisma from '@/services/db/client';
import * as slugUtils from '@/lib/slug';

vi.mock('@/services/db/client', () => ({
  default: {
    brand: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Brand DB Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(slugUtils, 'toSlug').mockImplementation(name =>
      name.toLowerCase().replace(/\s+/g, '-')
    );
  });

  describe('createBrand', () => {
    it('should create a brand with a slug', async () => {
      const input = { name: 'Test Brand', logo: 'http://example.com/logo.png', isActive: true };
      const expectedSlug = 'test-brand';
      const mockCreated = { id: '1', ...input, slug: expectedSlug };
      (prisma.brand.create as any).mockResolvedValue(mockCreated);

      const result = await createBrand(input);
      expect(prisma.brand.create).toHaveBeenCalledWith({
        data: { ...input, slug: expectedSlug },
      });
      expect(result).toEqual(mockCreated);
    });
  });

  describe('updateBrandBySlug', () => {
    it('should throw an error if brand not found', async () => {
      // Prisma.update when record not found throws an error
      const prismaError = new Error('Record not found');
      (prisma.brand.update as any).mockRejectedValue(prismaError);
      await expect(updateBrandBySlug('not-exist', { name: 'New' })).rejects.toThrow();
    });

    it('should update name (and NOT regenerate slug automatically)', async () => {
      const existingBrand = {
        id: '1',
        slug: 'old-brand',
        name: 'Old Brand',
        logo: null,
        isActive: true,
      };
      const updatedBrand = { ...existingBrand, name: 'New Brand' };
      (prisma.brand.update as any).mockResolvedValue(updatedBrand);
      // توجه: تابع updateBrandBySlug اسلاگ را از روی name بازتولید نمی‌کند
      const result = await updateBrandBySlug('old-brand', { name: 'New Brand' });
      expect(prisma.brand.update).toHaveBeenCalledWith({
        where: { slug: 'old-brand' },
        data: { name: 'New Brand' },
      });
      expect(result).toEqual(updatedBrand);
    });
  });

  describe('deleteBrandBySlug', () => {
    it('should throw an error if brand not found', async () => {
      (prisma.brand.delete as any).mockRejectedValue(new Error('Not found'));
      await expect(deleteBrandBySlug('not-exist')).rejects.toThrow();
    });

    it('should delete and return { success: true }', async () => {
      (prisma.brand.delete as any).mockResolvedValue({});
      const result = await deleteBrandBySlug('slug');
      expect(prisma.brand.delete).toHaveBeenCalledWith({ where: { slug: 'slug' } });
      expect(result).toEqual({ success: true });
    });
  });
});
