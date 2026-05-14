import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateUniqueSlug, toSlug } from '@/lib/slug';
import prisma from '@/services/db/client';

vi.mock('@/services/db/client', () => ({
  default: {
    blogPost: {
      findFirst: vi.fn(),
    },
  },
}));

describe('Slug Utilities', () => {
  beforeEach(() => {
    // ریست کردن موک قبل از هر تست
    vi.mocked(prisma.blogPost.findFirst).mockReset();
  });

  it('toSlug should convert title to slug', () => {
    expect(toSlug('Hello World')).toBe('Hello-World');
    expect(toSlug('تست عنوان')).toBe('تست-عنوان');
  });

  describe('generateUniqueSlug', () => {
    it('should return base slug if no conflict', async () => {
      vi.mocked(prisma.blogPost.findFirst).mockResolvedValue(null);
      const slug = await generateUniqueSlug('my-post');
      expect(slug).toBe('my-post');
    });

    it('should append suffix if slug exists', async () => {
      const mockFindFirst = vi.mocked(prisma.blogPost.findFirst);
      mockFindFirst
        .mockResolvedValueOnce({ id: '1', slug: 'my-post' } as any)
        .mockResolvedValueOnce(null);
      const slug = await generateUniqueSlug('my-post');
      expect(slug).toBe('my-post-1');
      expect(mockFindFirst).toHaveBeenCalledTimes(2);
      expect(mockFindFirst).toHaveBeenNthCalledWith(1, { where: { slug: 'my-post' } });
      expect(mockFindFirst).toHaveBeenNthCalledWith(2, { where: { slug: 'my-post-1' } });
    });

    it('should exclude given id when checking uniqueness', async () => {
      vi.mocked(prisma.blogPost.findFirst).mockResolvedValue(null);
      const slug = await generateUniqueSlug('my-post', 'post-123');
      expect(slug).toBe('my-post');
      expect(prisma.blogPost.findFirst).toHaveBeenCalledWith({
        where: {
          slug: 'my-post',
          id: { not: 'post-123' },
        },
      });
    });
  });
});
