import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPublishedPosts,
  getPostBySlug,
  getRecentPosts,
  getUsedTags,
  getTagsByPostId,
} from '@/services/blog/db/queries';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => ({
  default: {
    blogPost: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
    },
    tag: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Blog Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPublishedPosts', () => {
    it('should return paginated posts with safe transformation', async () => {
      const mockItems = [
        {
          id: '1',
          title: 'Post 1',
          slug: 'post-1',
          excerpt: 'Excerpt',
          coverImageUrl: null,
          readingMinutes: 2,
          publishedAt: new Date(),
          author: { name: 'Author1', image: 'img.jpg' },
          tags: [{ tag: { name: 'tag1' } }, { tag: { name: 'tag2' } }],
        },
      ];
      (prisma.blogPost.findMany as any).mockResolvedValue(mockItems);
      (prisma.blogPost.count as any).mockResolvedValue(1);
      const result = await getPublishedPosts({ page: 1, pageSize: 10 });
      expect(prisma.blogPost.findMany).toHaveBeenCalledWith({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        skip: 0,
        take: 10,
        include: {
          author: { select: expect.any(Object) },
          tags: { include: { tag: true } },
        },
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toHaveProperty('authorName', 'Author1');
      expect(result.items[0]).toHaveProperty('tags', ['tag1', 'tag2']);
      expect(result.total).toBe(1);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle empty result', async () => {
      (prisma.blogPost.findMany as any).mockResolvedValue([]);
      (prisma.blogPost.count as any).mockResolvedValue(0);
      const result = await getPublishedPosts({ page: 2, pageSize: 5 });
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(5);
      expect(result.pages).toBe(0);
    });

    it('should log and throw error on failure', async () => {
      (prisma.blogPost.findMany as any).mockRejectedValue(new Error('DB error'));
      await expect(getPublishedPosts({})).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getPostBySlug', () => {
    const mockPost = {
      id: '1',
      title: 'Test',
      slug: 'test',
      author: { name: 'Author', image: 'img.jpg' },
      tags: [{ tag: { name: 't1' } }],
    };
    it('should return post if found', async () => {
      (prisma.blogPost.findUnique as any).mockResolvedValue(mockPost);
      const result = await getPostBySlug('test');
      expect(result).toEqual(mockPost);
      expect(logger.info).toHaveBeenCalledWith('getPostBySlug success', expect.any(Object));
    });
    it('should return null if not found', async () => {
      (prisma.blogPost.findUnique as any).mockResolvedValue(null);
      const result = await getPostBySlug('missing');
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith('getPostBySlug: not found', expect.any(Object));
    });
    it('should log error on failure', async () => {
      (prisma.blogPost.findUnique as any).mockRejectedValue(new Error('Unique error'));
      await expect(getPostBySlug('test')).rejects.toThrow('Unique error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getRecentPosts', () => {
    it('should return limited posts sorted by publishedAt desc', async () => {
      // ۱. دیتای خام فرضی که شبیه خروجی واقعی Prisma باشه
      const rawPosts = [
        {
          id: '1',
          title: 'Post 1',
          slug: 'post-1',
          excerpt: 'Excerpt 1',
          coverImageUrl: null,
          readingMinutes: 5,
          publishedAt: new Date('2026-01-01'),
          author: { name: 'Ali', id: 'a1', image: null, role: 'ADMIN' },
          tags: [{ tag: { id: 't1', name: 'React', slug: 'react' } }],
        },
      ];

      vi.mocked(prisma.blogPost.findMany).mockResolvedValue(rawPosts as any);

      const result = await getRecentPosts(2);

      // ۲. بررسی فراخوانی درست دیتابیس
      expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PUBLISHED' },
          orderBy: { publishedAt: 'desc' },
          take: 2,
          include: expect.any(Object),
        })
      );

      // ۳. بررسی اینکه خروجی دقیقاً از فیلتر formatBlogPost رد شده یا نه
      expect(result).toEqual([
        {
          id: '1',
          title: 'Post 1',
          slug: 'post-1',
          excerpt: 'Excerpt 1',
          coverImageUrl: null,
          readingMinutes: 5,
          publishedAt: rawPosts[0].publishedAt,
          authorName: 'Ali',
          tags: ['React'], // تگ‌ها تبدیل به آرایه رشته‌ای شدن
        },
      ]);

      expect(logger.info).toHaveBeenCalled();
    });
    it('should default limit to 3', async () => {
      (prisma.blogPost.findMany as any).mockResolvedValue([]);
      await getRecentPosts();
      expect(prisma.blogPost.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 3 }));
    });
    it('should log error on failure', async () => {
      (prisma.blogPost.findMany as any).mockRejectedValue(new Error('Fail'));
      await expect(getRecentPosts()).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getUsedTags', () => {
    it('should return tags that have posts', async () => {
      const mockTags = [{ id: '1', name: 'tech', slug: 'tech' }];
      (prisma.tag.findMany as any).mockResolvedValue(mockTags);
      const result = await getUsedTags();
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        where: { posts: { some: {} } },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockTags);
      expect(logger.info).toHaveBeenCalled();
    });
    it('should return empty array if no tags', async () => {
      (prisma.tag.findMany as any).mockResolvedValue([]);
      const result = await getUsedTags();
      expect(result).toEqual([]);
    });
    it('should log error on failure', async () => {
      (prisma.tag.findMany as any).mockRejectedValue(new Error('DB down'));
      await expect(getUsedTags()).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getTagsByPostId', () => {
    const mockPost = {
      id: 'p1',
      tags: [
        { tag: { id: 't1', name: 'tag1', slug: 'tag1' } },
        { tag: { id: 't2', name: 'tag2', slug: 'tag2' } },
      ],
    };
    it('should return tags for existing post', async () => {
      (prisma.blogPost.findUnique as any).mockResolvedValue(mockPost);
      const result = await getTagsByPostId('p1');
      expect(prisma.blogPost.findUnique).toHaveBeenCalledWith({
        where: { id: 'p1' },
        include: { tags: { include: { tag: true } } },
      });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('tag1');
      expect(logger.info).toHaveBeenCalled();
    });
    it('should return empty array if post not found', async () => {
      (prisma.blogPost.findUnique as any).mockResolvedValue(null);
      const result = await getTagsByPostId('invalid');
      expect(result).toEqual([]);
      expect(logger.info).toHaveBeenCalledWith(
        'getTagsByPostId: post not found',
        expect.any(Object)
      );
    });
    it('should log error on failure', async () => {
      (prisma.blogPost.findUnique as any).mockRejectedValue(new Error('DB error'));
      await expect(getTagsByPostId('p1')).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
