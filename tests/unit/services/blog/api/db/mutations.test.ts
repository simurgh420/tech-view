// tests/unit/services/blog/db/mutations.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBlogPost, updatePost, deletePost } from '@/services/blog/db/mutations';
import prisma from '@/services/db/client';
import * as slugUtils from '@/lib/slug';
import { deleteImage } from '@/services/upload/deleteImage';
import { PrismaClient } from '@/app/generated/prisma/client';

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
    $transaction: vi.fn(callback => callback(prisma)),
  },
}));

// Mock deleteImage
vi.mock('@/services/upload/deleteImage', () => ({
  deleteImage: vi.fn().mockResolvedValue(undefined),
}));

describe('blog mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock slug utilities
    vi.spyOn(slugUtils, 'toSlug').mockImplementation(title =>
      title.toLowerCase().replace(/\s+/g, '-')
    );
    vi.spyOn(slugUtils, 'generateUniqueSlug').mockImplementation(async base => base);
  });

  describe('createBlogPost', () => {
    it('calls prisma.blogPost.create with correct data', async () => {
      const input = {
        title: 'Test Blog',
        excerpt: 'This is a valid summary',
        content: 'This is a long content for reading minutes calculation',
        coverImageUrl: '/test.jpg',
        authorId: 'user_123',
        tags: ['tag1', 'tag2'],
        status: 'PUBLISHED' as const,
        slug: 'dummy', // required by type but will be replaced
      };

      const expectedSlug = 'test-blog';
      const mockCreated = {
        id: 1,
        title: 'Test Blog',
        slug: expectedSlug,
        excerpt: input.excerpt,
        content: input.content,
        coverImageUrl: input.coverImageUrl,
        authorId: input.authorId,
        status: 'PUBLISHED',
        readingMinutes: expect.any(Number),
        publishedAt: expect.any(Date),
        tags: expect.any(Array),
      };
      (prisma.blogPost.create as any).mockResolvedValue(mockCreated);

      const result = await createBlogPost(input);

      expect(slugUtils.toSlug).toHaveBeenCalledWith('Test Blog');
      expect(slugUtils.generateUniqueSlug).toHaveBeenCalledWith(expectedSlug);
      expect(prisma.blogPost.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Test Blog',
            slug: expectedSlug,
            excerpt: input.excerpt,
            content: input.content,
            coverImageUrl: '/test.jpg',
            authorId: 'user_123',
            status: 'PUBLISHED',
            readingMinutes: expect.any(Number),
            publishedAt: expect.any(Date),
            tags: expect.any(Object),
          }),
          include: expect.any(Object),
        })
      );
      expect(result).toEqual(mockCreated);
    });
  });

  describe('updatePost', () => {
    it('updates post correctly', async () => {
      const existingPost = {
        id: 'post-1',
        slug: 'test-slug',
        coverImageUrl: '/old.jpg',
        tags: [],
        title: 'Old Title',
        excerpt: 'Old excerpt',
        content: 'Old content',
        status: 'DRAFT',
        publishedAt: null,
      };
      const updatedPost = {
        ...existingPost,
        title: 'Updated Blog',
        excerpt: 'new excerpt',
        content: 'this is a long enough content for validation',
        coverImageUrl: '/image.jpg',
        slug: 'updated-blog',
      };

      (prisma.blogPost.findUnique as any)
        .mockResolvedValueOnce(existingPost)
        .mockResolvedValueOnce(updatedPost);
      (prisma.blogPost.update as any).mockResolvedValue(updatedPost);
      (prisma.tagOnPost.deleteMany as any).mockResolvedValue({});
      (prisma.$transaction as any).mockImplementation(async (cb: (arg0: PrismaClient) => any) =>
        cb(prisma)
      );
      // Prevent slug conflict
      vi.spyOn(slugUtils, 'generateUniqueSlug').mockResolvedValue('updated-blog');

      const result = await updatePost('test-slug', {
        title: 'Updated Blog',
        excerpt: 'new excerpt',
        content: 'this is a long enough content for validation',
        coverImageUrl: '/image.jpg',
        tags: ['tag1'],
      });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.tagOnPost.deleteMany).toHaveBeenCalledWith({
        where: { postId: existingPost.id },
      });
      expect(prisma.blogPost.update).toHaveBeenCalledWith({
        where: { id: existingPost.id },
        data: expect.objectContaining({
          title: 'Updated Blog',
          excerpt: 'new excerpt',
          content: 'this is a long enough content for validation',
          coverImageUrl: '/image.jpg',
          slug: 'updated-blog',
          readingMinutes: expect.any(Number),
        }),
      });
      expect(deleteImage).toHaveBeenCalledWith('/old.jpg');
      expect(result).toEqual(updatedPost);
    });
  });

  describe('deletePost', () => {
    it('deletes post when found', async () => {
      const post = { id: 1, slug: 'test-slug', coverImageUrl: '/img.jpg' };
      (prisma.blogPost.findUnique as any).mockResolvedValue(post);
      (prisma.blogPost.delete as any).mockResolvedValue(post);

      const result = await deletePost('test-slug');

      expect(prisma.blogPost.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-slug' },
      });
      expect(deleteImage).toHaveBeenCalledWith('/img.jpg');
      expect(prisma.blogPost.delete).toHaveBeenCalledWith({
        where: { slug: 'test-slug' },
      });
      expect(result).toEqual(post);
    });
  });
});
