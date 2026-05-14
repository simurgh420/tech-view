import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBlogPost, updatePost, deletePost } from '@/services/blog/db/mutations';
import prisma from '@/services/db/client';
import * as slugUtils from '@/lib/slug';
import { deleteImage } from '@/services/upload/deleteImage';
import { CreateBlogInput } from '@/lib/validation/blog';

// Mock Prisma
vi.mock('@/services/db/client', () => ({
  default: {
    blogPost: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    tagOnPost: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((callback: any) => callback(prisma)),
  },
}));

// Mock deleteImage
vi.mock('@/services/upload/deleteImage', () => ({
  deleteImage: vi.fn().mockResolvedValue(undefined),
}));

describe('Blog DB Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock toSlug و generateUniqueSlug
    vi.spyOn(slugUtils, 'toSlug').mockImplementation((title: string) => title.replace(/\s+/g, '-'));
    vi.spyOn(slugUtils, 'generateUniqueSlug').mockImplementation(async (base: string) => base);
  });

  describe('createBlogPost', () => {
    it('should generate unique slug and create post', async () => {
      const input: CreateBlogInput = {
        title: 'تست عنوان',
        excerpt: 'خلاصه ده کاراکتری...',
        content: 'محتوای بیست کاراکتری برای تست که به اندازه کافی طولانی است',
        tags: ['تگ1', 'تگ2'],
        authorId: 'user-1',
        coverImageUrl: null,
        status: 'PUBLISHED',
        slug: 'dummy-slug', // required by type, but will be replaced
      };

      const expectedSlug = 'تست-عنوان';
      const mockCreated = {
        id: '1',
        ...input,
        slug: expectedSlug,
        readingMinutes: 1,
        publishedAt: new Date(),
        updatedAt: new Date(),
        author: { id: 'user-1', name: 'رضا' },
        tags: [],
      };
      (prisma.blogPost.create as any).mockResolvedValue(mockCreated);

      const result = await createBlogPost(input);

      expect(slugUtils.toSlug).toHaveBeenCalledWith('تست عنوان');
      expect(slugUtils.generateUniqueSlug).toHaveBeenCalledWith(expectedSlug);
      expect(prisma.blogPost.create).toHaveBeenCalled();
      expect(result.title).toBe('تست عنوان');
    });
  });

  describe('updatePost', () => {
    it('should return null if post not found', async () => {
      (prisma.blogPost.findUnique as any).mockResolvedValue(null);
      const result = await updatePost('slug', { title: 'New' });
      expect(result).toBeNull();
    });

    it('should update post in transaction and delete old image', async () => {
      const existingPost = {
        id: 'post-1',
        slug: 'old-slug',
        coverImageUrl: 'old.jpg',
        tags: [],
        title: 'Old Title',
        excerpt: 'Old excerpt',
        content: 'Old content',
        status: 'DRAFT',
        publishedAt: null,
      };

      const updatedPost = {
        ...existingPost,
        title: 'New Title',
        coverImageUrl: 'new.jpg',
        slug: 'new-slug', // اسلاگ جدید
      };

      // Mock findUnique: اول پست موجود، بعد پست به‌روز شده
      (prisma.blogPost.findUnique as any)
        .mockResolvedValueOnce(existingPost)
        .mockResolvedValueOnce(updatedPost);

      (prisma.blogPost.update as any).mockResolvedValue(updatedPost);
      (prisma.tagOnPost.deleteMany as any).mockResolvedValue({});
      (prisma.$transaction as any).mockImplementation(async (callback: any) => callback(prisma));

      // جلوگیری از تداخل generateUniqueSlug
      vi.spyOn(slugUtils, 'generateUniqueSlug').mockResolvedValue('new-slug');

      const result = await updatePost('old-slug', {
        title: 'New Title',
        coverImageUrl: 'new.jpg',
      });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.blogPost.update).toHaveBeenCalled();
      expect(deleteImage).toHaveBeenCalledWith('old.jpg'); // بررسی حذف تصویر قدیمی
      expect(result?.coverImageUrl).toBe('new.jpg');
      expect(result?.title).toBe('New Title');
    });
  });

  describe('deletePost', () => {
    it('should delete post and return it', async () => {
      const post = { id: '1', coverImageUrl: null, slug: 'test' };
      (prisma.blogPost.findUnique as any).mockResolvedValue(post);
      (prisma.blogPost.delete as any).mockResolvedValue(post);
      const result = await deletePost('test');
      expect(result).toEqual(post);
    });

    it('should return null if post not found', async () => {
      (prisma.blogPost.findUnique as any).mockResolvedValue(null);
      expect(await deletePost('slug')).toBeNull();
    });
  });
});
