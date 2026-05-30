import { describe, it, expect } from 'vitest';
import { blogFormSchema, createBlogSchema, updateBlogSchema } from '@/lib/validation/blog';

describe('Blog Validation Schemas', () => {
  const validFormInput = {
    title: 'عنوان تست',
    excerpt: 'خلاصه تست بلند',
    content: 'محتوای تست بلند برای بلاگ',
    tags: ['تست'],
    coverImageUrl: undefined,
  };

  describe('blogFormSchema (Client)', () => {
    it('should accept valid form input', () => {
      expect(blogFormSchema.safeParse(validFormInput).success).toBe(true);
    });

    it('should reject title shorter than 3 chars', () => {
      const input = { ...validFormInput, title: 'ت' };
      const result = blogFormSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('title');
    });

    it('should accept File or URL for coverImageUrl', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(blogFormSchema.safeParse({ ...validFormInput, coverImageUrl: file }).success).toBe(
        true
      );
      expect(
        blogFormSchema.safeParse({
          ...validFormInput,
          coverImageUrl: 'https://example.com/img.jpg',
        }).success
      ).toBe(true);
    });
  });

  describe('createBlogSchema (Server)', () => {
    const validServerInput = {
      title: 'عنوان تست',
      slug: 'test-slug',
      excerpt: 'خلاصه تست بلند',
      content: 'محتوای تست بلند برای بلاگ',
      tags: ['تست'],
      authorId: 'user-1',
    };

    it('should require authorId', () => {
      const withoutAuthor = { ...validServerInput, authorId: undefined };
      const result = createBlogSchema.safeParse(withoutAuthor);
      expect(result.success).toBe(false);
    });

    it('should allow missing slug (slug is optional)', () => {
      const withoutSlug = { ...validServerInput, slug: undefined };
      const result = createBlogSchema.safeParse(withoutSlug);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBeUndefined();
      }
    });
    it('should set default values for optional fields', () => {
      const result = createBlogSchema.parse({
        title: 'عنوان تست کافی',
        slug: 'slug',
        excerpt: 'این یک خلاصه ده کاراکتری است',
        content: 'این یک محتوای بیست کاراکتری برای تست است که بیشتر از بیست حرف دارد',
        tags: ['تست'],
        authorId: 'user-1',
      });
      expect(result).toEqual(
        expect.objectContaining({
          coverImageUrl: null,
          status: 'PUBLISHED',
        })
      );
    });
  });

  describe('updateBlogSchema', () => {
    it('should allow partial data', () => {
      expect(updateBlogSchema.safeParse({ title: 'New Title' }).success).toBe(true);
    });

    it('should accept null for coverImageUrl', () => {
      expect(updateBlogSchema.safeParse({ coverImageUrl: null }).success).toBe(true);
    });
  });
});
