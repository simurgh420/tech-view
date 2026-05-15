import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCategory, updateCategory, deleteCategory } from '@/services/categories/db/mutations';
import prisma from '@/services/db/client';
import * as slugUtils from '@/lib/slug';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => ({
  default: {
    category: {
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

describe('Category DB Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(slugUtils, 'toSlug').mockImplementation(title =>
      title.toLowerCase().replace(/\s+/g, '-')
    );
    vi.spyOn(slugUtils, 'generateUniqueSlug').mockImplementation(async base => base);
  });

  describe('createCategory', () => {
    const input = { title: 'Electronics', icon: 'icon-url', parentId: null };
    const expectedSlug = 'electronics';
    const mockCategory = { id: '1', ...input, slug: expectedSlug, order: 0 };

    it('should create category with auto-generated slug and order 0', async () => {
      (prisma.category.create as any).mockResolvedValue(mockCategory);
      const result = await createCategory(input);
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          title: 'Electronics',
          slug: expectedSlug,
          icon: 'icon-url',
          parentId: null,
          order: 0,
        },
      });
      expect(result).toEqual(mockCategory);
      expect(logger.info).toHaveBeenCalledWith(
        'createCategory success',
        expect.objectContaining({ categoryId: '1' })
      );
    });

    it('should log error and rethrow on failure', async () => {
      const dbError = new Error('Duplicate slug');
      (prisma.category.create as any).mockRejectedValue(dbError);
      await expect(createCategory(input)).rejects.toThrow('Duplicate slug');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    const slug = 'electronics';
    const existing = {
      id: '1',
      title: 'Electronics',
      slug: 'electronics',
      icon: null,
      parentId: null,
      order: 0,
    };

    it('should return null if category not found', async () => {
      (prisma.category.findUnique as any).mockResolvedValue(null);
      const result = await updateCategory(slug, { title: 'New' });
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'updateCategory: category not found',
        expect.any(Object)
      );
    });

    it('should update only icon (no slug change)', async () => {
      (prisma.category.findUnique as any).mockResolvedValue(existing);
      const updated = { ...existing, icon: 'new-icon' };
      (prisma.category.update as any).mockResolvedValue(updated);
      const result = await updateCategory(slug, { icon: 'new-icon' });
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { slug },
        data: { icon: 'new-icon' },
      });
      expect(result).toEqual(updated);
      expect(logger.info).toHaveBeenCalledWith(
        'updateCategory success',
        expect.objectContaining({ oldSlug: slug })
      );
    });

    it('should update title and generate new slug (unique)', async () => {
      (prisma.category.findUnique as any).mockResolvedValue(existing);
      const updated = { ...existing, title: 'New Title', slug: 'new-title' };
      (prisma.category.update as any).mockResolvedValue(updated);
      vi.spyOn(slugUtils, 'generateUniqueSlug').mockResolvedValueOnce('new-title');
      const result = await updateCategory(slug, { title: 'New Title' });
      expect(slugUtils.generateUniqueSlug).toHaveBeenCalledWith('new-title', existing.id);
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { slug },
        data: { title: 'New Title', slug: 'new-title' },
      });
      expect(result).toEqual(updated);
    });

    it('should update parentId without affecting slug', async () => {
      (prisma.category.findUnique as any).mockResolvedValue(existing);
      const updated = { ...existing, parentId: 'parent-1' };
      (prisma.category.update as any).mockResolvedValue(updated);
      const result = await updateCategory(slug, { parentId: 'parent-1' });
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { slug },
        data: { parentId: 'parent-1' },
      });
      expect(result).toEqual(updated);
    });

    it('should log error on failure', async () => {
      (prisma.category.findUnique as any).mockResolvedValue(existing);
      (prisma.category.update as any).mockRejectedValue(new Error('Constraint violation'));
      await expect(updateCategory(slug, { title: 'New' })).rejects.toThrow('Constraint violation');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    const slug = 'electronics';

    it('should return null if category not found', async () => {
      (prisma.category.findUnique as any).mockResolvedValue(null);
      const result = await deleteCategory(slug);
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'deleteCategory: category not found',
        expect.any(Object)
      );
    });

    it('should delete and return true', async () => {
      (prisma.category.findUnique as any).mockResolvedValue({ id: '1', slug });
      (prisma.category.delete as any).mockResolvedValue({});
      const result = await deleteCategory(slug);
      expect(result).toBe(true);
      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { slug } });
      expect(logger.info).toHaveBeenCalledWith(
        'deleteCategory success',
        expect.objectContaining({ slug })
      );
    });

    it('should log error on failure', async () => {
      (prisma.category.findUnique as any).mockResolvedValue({ id: '1', slug });
      (prisma.category.delete as any).mockRejectedValue(new Error('Foreign key constraint'));
      await expect(deleteCategory(slug)).rejects.toThrow('Foreign key constraint');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
