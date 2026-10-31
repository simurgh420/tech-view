// features/blog/server/formatBlogPost.test.ts
import { describe, it, expect } from 'vitest';

import { formatBlogPost, type BlogPostWithRelations } from './formatBlogPost';

const createRawPost = (overrides: Record<string, unknown> = {}): BlogPostWithRelations =>
  ({
    id: 'post-1',
    title: 'عنوان تستی',
    slug: 'test-post',
    excerpt: 'خلاصه تستی',
    coverImageUrl: '/covers/test.png',
    readingMinutes: 5,
    publishedAt: new Date('2025-03-21T10:00:00.000Z'),
    // فیلدهایی که نباید در خروجی بیایند
    content: '<p>محتوای کامل</p>',
    authorId: 'user-1',
    createdAt: new Date('2025-03-20T10:00:00.000Z'),
    author: { name: 'علی رضایی' },
    tags: [{ tag: { id: 't1', name: 'موبایل' } }, { tag: { id: 't2', name: 'لپ‌تاپ' } }],
    ...overrides,
  }) as unknown as BlogPostWithRelations;

describe('formatBlogPost', () => {
  describe('نگاشت فیلدهای اصلی', () => {
    it('should map all fields correctly', () => {
      const raw = createRawPost();

      expect(formatBlogPost(raw)).toEqual({
        id: 'post-1',
        title: 'عنوان تستی',
        slug: 'test-post',
        excerpt: 'خلاصه تستی',
        coverImageUrl: '/covers/test.png',
        readingMinutes: 5,
        publishedAt: new Date('2025-03-21T10:00:00.000Z'),
        authorName: 'علی رضایی',
        tags: ['موبایل', 'لپ‌تاپ'],
      });
    });

    it('should not leak extra fields from the raw post', () => {
      const result = formatBlogPost(createRawPost());

      expect(result).not.toHaveProperty('content');
      expect(result).not.toHaveProperty('authorId');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('author');
    });
  });

  describe('coverImageUrl', () => {
    it('should return null when coverImageUrl is null', () => {
      expect(formatBlogPost(createRawPost({ coverImageUrl: null })).coverImageUrl).toBeNull();
    });

    it('should return null when coverImageUrl is undefined', () => {
      expect(formatBlogPost(createRawPost({ coverImageUrl: undefined })).coverImageUrl).toBeNull();
    });
  });

  describe('publishedAt', () => {
    it('should return null when post is not published', () => {
      expect(formatBlogPost(createRawPost({ publishedAt: null })).publishedAt).toBeNull();
    });

    it('should return null when publishedAt is undefined', () => {
      expect(formatBlogPost(createRawPost({ publishedAt: undefined })).publishedAt).toBeNull();
    });
  });

  describe('authorName', () => {
    it('should return author name when author exists', () => {
      expect(formatBlogPost(createRawPost()).authorName).toBe('علی رضایی');
    });

    it('should return null when author is null', () => {
      expect(formatBlogPost(createRawPost({ author: null })).authorName).toBeNull();
    });

    it('should return null when author name is null', () => {
      expect(formatBlogPost(createRawPost({ author: { name: null } })).authorName).toBeNull();
    });
  });

  describe('tags', () => {
    it('should return tag names in order', () => {
      const raw = createRawPost({
        tags: [{ tag: { name: 'c' } }, { tag: { name: 'a' } }, { tag: { name: 'b' } }],
      });

      expect(formatBlogPost(raw).tags).toEqual(['c', 'a', 'b']);
    });

    it('should return empty array when tags is empty', () => {
      expect(formatBlogPost(createRawPost({ tags: [] })).tags).toEqual([]);
    });

    it('should return empty array when tags is undefined', () => {
      expect(formatBlogPost(createRawPost({ tags: undefined })).tags).toEqual([]);
    });
  });

  describe('readingMinutes', () => {
    it('should pass readingMinutes through unchanged', () => {
      expect(formatBlogPost(createRawPost({ readingMinutes: 12 })).readingMinutes).toBe(12);
      expect(formatBlogPost(createRawPost({ readingMinutes: null })).readingMinutes).toBeNull();
    });
  });
});
