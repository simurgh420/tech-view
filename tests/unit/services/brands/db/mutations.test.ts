import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBrand, updateBrandBySlug, deleteBrandBySlug } from '@/services/brands/db/mutations';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';
import * as slugCommon from '@/lib/slug-common';
import * as slugServer from '@/lib/server/slug';
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

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Brand DB Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(slugCommon, 'toSlug').mockImplementation(name =>
      name.toLowerCase().replace(/\s+/g, '-')
    );
    vi.spyOn(slugServer, 'generateUniqueSlug').mockImplementation(async base => base);
  });

  describe('createBrand', () => {
    const input = { name: 'Nike', logo: 'https://example.com/logo.png', isActive: true };
    const expectedSlug = 'nike';
    const mockBrand = { id: '1', ...input, slug: expectedSlug };

    it('should create a brand with auto-generated slug and default isActive', async () => {
      (prisma.brand.create as any).mockResolvedValue(mockBrand);
      const result = await createBrand(input);
      expect(prisma.brand.create).toHaveBeenCalledWith({
        data: {
          name: 'Nike',
          slug: expectedSlug,
          logo: input.logo,
          isActive: true,
        },
      });
      expect(result).toEqual(mockBrand);
      expect(slugServer.generateUniqueSlug).toHaveBeenCalledWith('nike');
      expect(logger.info).toHaveBeenCalledWith(
        'createBrand success',
        expect.objectContaining({ brandId: '1' })
      );
    });

    it('should use default isActive true when not provided', async () => {
      const inputWithoutActive = { name: 'Adidas', logo: null } as any;
      const mock = { id: '2', name: 'Adidas', slug: 'adidas', logo: null, isActive: true };
      (prisma.brand.create as any).mockResolvedValue(mock);
      await createBrand(inputWithoutActive);
      expect(prisma.brand.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ isActive: true }),
      });
    });
    it('should log error and rethrow on failure', async () => {
      const dbError = new Error('Duplicate slug');
      (prisma.brand.create as any).mockRejectedValue(dbError);
      await expect(createBrand({ name: 'Nike' } as any)).rejects.toThrow('Duplicate slug');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateBrandBySlug', () => {
    const slug = 'nike';
    const existing = { id: '1', name: 'Nike', slug: 'nike', logo: null, isActive: true };

    it('should return null if brand not found', async () => {
      (prisma.brand.findUnique as any).mockResolvedValue(null);
      const result = await updateBrandBySlug(slug, { name: 'New' });
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'updateBrandBySlug: brand not found',
        expect.any(Object)
      );
    });

    it('should update only logo without changing slug', async () => {
      (prisma.brand.findUnique as any).mockResolvedValue(existing);
      const updated = { ...existing, logo: 'new-logo.jpg' };
      (prisma.brand.update as any).mockResolvedValue(updated);
      const result = await updateBrandBySlug(slug, { logo: 'new-logo.jpg' });
      expect(prisma.brand.update).toHaveBeenCalledWith({
        where: { slug },
        data: { logo: 'new-logo.jpg' },
      });
      expect(result).toEqual(updated);
      expect(logger.info).toHaveBeenCalledWith(
        'updateBrandBySlug success',
        expect.objectContaining({ oldSlug: slug })
      );
    });

    it('should update name and regenerate slug (unique)', async () => {
      (prisma.brand.findUnique as any).mockResolvedValue(existing);
      const updated = { ...existing, name: 'Nike Sports', slug: 'nike-sports' };
      (prisma.brand.update as any).mockResolvedValue(updated);
      vi.spyOn(slugServer, 'generateUniqueSlug').mockResolvedValueOnce('nike-sports');
      const result = await updateBrandBySlug(slug, { name: 'Nike Sports' });
      expect(slugServer.generateUniqueSlug).toHaveBeenCalledWith('nike-sports', existing.id);
      expect(prisma.brand.update).toHaveBeenCalledWith({
        where: { slug },
        data: { name: 'Nike Sports', slug: 'nike-sports' },
      });
      expect(result).toEqual(updated);
    });

    it('should update isActive without affecting slug', async () => {
      (prisma.brand.findUnique as any).mockResolvedValue(existing);
      const updated = { ...existing, isActive: false };
      (prisma.brand.update as any).mockResolvedValue(updated);
      const result = await updateBrandBySlug(slug, { isActive: false });
      expect(prisma.brand.update).toHaveBeenCalledWith({
        where: { slug },
        data: { isActive: false },
      });
      expect(result).toEqual(updated);
    });

    it('should log error on failure', async () => {
      (prisma.brand.findUnique as any).mockResolvedValue(existing);
      (prisma.brand.update as any).mockRejectedValue(new Error('DB error'));
      await expect(updateBrandBySlug(slug, { name: 'New' })).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteBrandBySlug', () => {
    const slug = 'nike';

    it('should return null if brand not found', async () => {
      (prisma.brand.findUnique as any).mockResolvedValue(null);
      const result = await deleteBrandBySlug(slug);
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'deleteBrandBySlug: brand not found',
        expect.any(Object)
      );
    });

    it('should delete and return true', async () => {
      (prisma.brand.findUnique as any).mockResolvedValue({ id: '1', slug });
      (prisma.brand.delete as any).mockResolvedValue({});
      const result = await deleteBrandBySlug(slug);
      expect(result).toBe(true);
      expect(prisma.brand.delete).toHaveBeenCalledWith({ where: { slug } });
      expect(logger.info).toHaveBeenCalledWith(
        'deleteBrandBySlug success',
        expect.objectContaining({ slug })
      );
    });

    it('should log error on failure', async () => {
      (prisma.brand.findUnique as any).mockResolvedValue({ id: '1', slug });
      (prisma.brand.delete as any).mockRejectedValue(new Error('FK constraint'));
      await expect(deleteBrandBySlug(slug)).rejects.toThrow('FK constraint');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
