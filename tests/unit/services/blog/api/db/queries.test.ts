// tests/unit/server/blog/db/queries.test.ts

import { describe, it, expect, vi } from 'vitest';
import prisma from '@/services/db/client';
import {
  getPublishedPosts,
  getPostBySlug,
  getRecentPosts,
  getUsedTags,
  getTagsByPostId,
} from '@/services/blog/db/queries';
vi.mock('@/services/db/client', () => ({
  default: {
    blogPost: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn() },
    tag: { findMany: vi.fn() },
  },
}));

describe('blog queries', async () => {
  it('getPublishedPosts returns safe items with pagination', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Test Blog',
        slug: 'test-blog',
        excerpt: 'Summary',
        coverImageUrl: '/test.jpg',
        readingMinutes: 5,
        publishedAt: new Date(),
        author: 'Mohammadreza',
        tags: [{ tag: { name: 'tag1' } }],
      },
    ];
     
    (prisma.blogPost.findMany as any).mockResolvedValue(mockPosts);
     
    (prisma.blogPost.count as any).mockResolvedValue(1);
    const result = await getPublishedPosts({ page: 1, pageSize: 10 });
    expect(prisma.blogPost.findMany).toHaveBeenCalled();
    expect(prisma.blogPost.count).toHaveBeenCalled();
    expect(result.items[0]).toMatchObject({ id: '1', title: 'Test Blog', tags: ['tag1'] });
    expect(result.total).toBe(1);
    expect(result.pages).toBe(1);
  });
  it('getPostBySlug calls prisma.blogPost.findUnique with slug', async () => {
    const mockPost = { id: '1', slug: 'test-blog', title: 'Test Blog' };
     
    (prisma.blogPost.findUnique as any).mockResolvedValue(mockPost);
    const result = await getPostBySlug('test-blog');
    expect(prisma.blogPost.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'test-blog' } })
    );
    expect(result).toEqual(mockPost);
  });
  it('getRecentPosts calls prisma.blogPost.findMany with limit', async () => {
    const mockPosts = [{ id: '1', title: 'Recent Blog' }];
     
    (prisma.blogPost.findMany as any).mockResolvedValue(mockPosts);
    const result = await getRecentPosts(2);
    expect(prisma.blogPost.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 2 }));
    expect(result).toEqual(mockPosts);
  });
  it('getUsedTags returns tags from prisma.tag.findMany', async () => {
    const mockTags = [{ id: '1', name: 'tag1', slug: 'tag1' }];
     
    (prisma.tag.findMany as any).mockResolvedValue(mockTags);
    const result = await getUsedTags();
    expect(prisma.tag.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockTags);
  });
  it('getTagsByPostId returns tags if post exists', async () => {
    const mockPost = { id: '1', tags: [{ tag: { id: 't1', name: 'tag1' } }] };
     
    (prisma.blogPost.findUnique as any).mockResolvedValue(mockPost);
    const result = await getTagsByPostId('1');
    expect(prisma.blogPost.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } })
    );
    expect(result).toEqual([{ id: 't1', name: 'tag1' }]);
  });
  it('getTagsByPostId returns empty array if post not found', async () => {
     
    (prisma.blogPost.findUnique as any).mockResolvedValue(null);
    const result = await getTagsByPostId('not-found');
    expect(result).toEqual([]);
  });
});
