import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPublishedPosts, getPostBySlug } from '@/services/blog/db/queries';

vi.mock('@/services/db/client', () => ({
  default: {
    blogPost: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import prisma from '@/services/db/client';

describe('Blog Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getPublishedPosts should include author with safe select', async () => {
    (prisma.blogPost.findMany as any).mockResolvedValue([]);
    (prisma.blogPost.count as any).mockResolvedValue(0);

    const result = await getPublishedPosts({ page: 1, pageSize: 10 });

    const callArgs = (prisma.blogPost.findMany as any).mock.calls[0][0];
    expect(callArgs).toMatchObject({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      skip: 0,
      take: 10,
      include: {
        author: {
          select: { name: true, image: true },
        },
        tags: { include: { tag: true } },
      },
    });

    expect(result).toEqual({ items: [], total: 0, page: 1, pageSize: 10, pages: 0 });
  });

  it('getPostBySlug should return null if not found', async () => {
    (prisma.blogPost.findUnique as any).mockResolvedValue(null);
    const result = await getPostBySlug('not-exist');
    expect(result).toBeNull();
    expect(prisma.blogPost.findUnique).toHaveBeenCalledWith({
      where: { slug: 'not-exist' }, 
      include: {
        author: {
          select: {
            id: true, 
            name: true,
            image: true,
            role: true, 
          },
        },
        tags: { include: { tag: true } },
      },
    });
  });
});
