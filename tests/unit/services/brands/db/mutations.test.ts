import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBlogPost, updatePost, deletePost } from '@/services/blog/db/mutations';
import prisma from '@/services/db/client';
import * as slugUtils from '@/lib/slug';
import { deleteImage } from '@/services/upload/deleteImage';
import { logger } from '@/lib/logger';
import { PrismaClient } from '@/app/generated/prisma/client';
import { CreateBlogInput } from '@/lib/validation/blog';

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
    $transaction: vi.fn(callback => callback(prisma)),
  },
}));

vi.mock('@/services/upload/deleteImage', () => ({
  deleteImage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Blog DB Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(slugUtils, 'toSlug').mockImplementation(title =>
      title.toLowerCase().replace(/\s+/g, '-')
    );
    vi.spyOn(slugUtils, 'generateUniqueSlug').mockImplementation(async base => base);
  });

  describe('createBlogPost', () => {
    it('should create a post with unique slug', async () => {
      const input: CreateBlogInput = {
        title: 'Test Title',
        excerpt: 'Long enough excerpt',
        content: 'Content with more than twenty characters for testing.',
        tags: ['tag1', 'tag2'],
        authorId: 'user1',
        coverImageUrl: null,
        status: 'PUBLISHED',
        slug: 'dummy-slug', // مقدار placeholder
      };
      const expectedSlug = 'test-title';
      const mockCreated = { id: '1', ...input, slug: expectedSlug, readingMinutes: 1 };
      (prisma.blogPost.create as any).mockResolvedValue(mockCreated);

      const result = await createBlogPost(input);
      expect(slugUtils.toSlug).toHaveBeenCalledWith('Test Title');
      expect(slugUtils.generateUniqueSlug).toHaveBeenCalledWith(expectedSlug);
      expect(prisma.blogPost.create).toHaveBeenCalled();
      expect(result).toEqual(mockCreated);
      expect(logger.info).toHaveBeenCalledWith(
        'createBlogPost success',
        expect.objectContaining({ blogId: '1', slug: expectedSlug })
      );
    });

    it('should log and throw error on failure', async () => {
      (prisma.blogPost.create as any).mockRejectedValue(new Error('DB error'));
      const input: CreateBlogInput = {
        title: 'Test',
        excerpt: 'Excerpt long enough ten chars',
        content: 'Content long enough twenty chars for validation.',
        tags: ['tag1'],
        authorId: 'u1',
        coverImageUrl: null,
        status: 'PUBLISHED',
        slug: 'dummy-slug',
      };
      await expect(createBlogPost(input)).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updatePost', () => {
    const existingPost = {
      id: 'p1',
      slug: 'old-slug',
      coverImageUrl: 'old.jpg',
      tags: [],
      title: 'Old',
      excerpt: 'Old excerpt',
      content: 'Old content',
      status: 'DRAFT',
      publishedAt: null,
    };
    const updatedPost = {
      ...existingPost,
      title: 'New',
      coverImageUrl: 'new.jpg',
      slug: 'new-slug',
    };

    it('should return null if post not found', async () => {
      (prisma.blogPost.findUnique as any).mockResolvedValue(null);
      const result = await updatePost('missing', { title: 'New' });
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith('updatePost: post not found', expect.any(Object));
    });

    it('should update post in transaction and delete old image', async () => {
      (prisma.blogPost.findUnique as any)
        .mockResolvedValueOnce(existingPost)
        .mockResolvedValueOnce(updatedPost);
      (prisma.blogPost.update as any).mockResolvedValue(updatedPost);
      (prisma.tagOnPost.deleteMany as any).mockResolvedValue({});
      (prisma.$transaction as any).mockImplementation(async (cb: (arg0: PrismaClient) => any) =>
        cb(prisma)
      );
      vi.spyOn(slugUtils, 'generateUniqueSlug').mockResolvedValue('new-slug');

      const result = await updatePost('old-slug', { title: 'New', coverImageUrl: 'new.jpg' });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.blogPost.update).toHaveBeenCalled();
      expect(deleteImage).toHaveBeenCalledWith('old.jpg');
      expect(result).toEqual(updatedPost);
      expect(logger.info).toHaveBeenCalledWith(
        'updatePost success',
        expect.objectContaining({ slug: 'old-slug' })
      );
    });

    it('should log error on transaction failure', async () => {
      (prisma.blogPost.findUnique as any).mockResolvedValue(existingPost);
      (prisma.$transaction as any).mockRejectedValue(new Error('Transaction failed'));
      await expect(updatePost('old-slug', { title: 'New' })).rejects.toThrow('Transaction failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deletePost', () => {
    it('should delete post and remove image', async () => {
      const post = { id: 'p1', slug: 'test', coverImageUrl: 'img.jpg' };
      (prisma.blogPost.findUnique as any).mockResolvedValue(post);
      (prisma.blogPost.delete as any).mockResolvedValue(post);
      const result = await deletePost('test');
      expect(deleteImage).toHaveBeenCalledWith('img.jpg');
      expect(result).toEqual(post);
      expect(logger.info).toHaveBeenCalledWith('deletePost success', expect.any(Object));
    });

    it('should return null if post not found', async () => {
      (prisma.blogPost.findUnique as any).mockResolvedValue(null);
      const result = await deletePost('missing');
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith('deletePost: post not found', expect.any(Object));
    });

    it('should log error on delete failure', async () => {
      (prisma.blogPost.findUnique as any).mockResolvedValue({ id: 'p1', coverImageUrl: null });
      (prisma.blogPost.delete as any).mockRejectedValue(new Error('Delete failed'));
      await expect(deletePost('test')).rejects.toThrow('Delete failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
