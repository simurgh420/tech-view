// features/search/server/searchNormalizer.test.ts
import { describe, it, expect } from 'vitest';

import { normalizeSearchResults } from './searchNormalizer';

const run = (input: { blogs?: any[]; products?: any[]; categories?: any[] }) =>
  normalizeSearchResults({ blogs: [], products: [], categories: [], ...input });

const rawBlog = (o: Record<string, unknown> = {}) => ({
  id: 'b1',
  title: 'مقاله',
  slug: 'article',
  excerpt: 'خلاصه',
  coverImageUrl: '/cover.png',
  publishedAt: new Date('2025-01-01T00:00:00.000Z'),
  tags: [{ tag: { id: 't1', name: 'موبایل', slug: 'mobile' } }],
  ...o,
});

const rawProduct = (o: Record<string, unknown> = {}) => ({
  id: 'p1',
  title: 'آیفون',
  slug: 'iphone',
  description: 'توضیحات',
  price: '1000',
  thumbnail: '/t.png',
  brand: { name: 'Apple' },
  category: { title: 'موبایل' },
  subCategory: { title: 'گوشی' },
  ...o,
});

const rawCategory = (o: Record<string, unknown> = {}) => ({
  id: 'c1',
  title: 'موبایل',
  slug: 'mobile',
  icon: 'phone',
  parent: { title: 'دیجیتال' },
  ...o,
});

describe('search/server/searchNormalizer › normalizeSearchResults', () => {
  describe('کلی', () => {
    it('should return an empty array when all lists are empty', () => {
      expect(run({})).toEqual([]);
    });

    it('should order results: blogs, then products, then categories', () => {
      const result = run({
        categories: [rawCategory()],
        products: [rawProduct()],
        blogs: [rawBlog()],
      });

      expect(result.map(r => r.type)).toEqual(['blog', 'product', 'category']);
    });

    it('should keep the input order within each type', () => {
      const result = run({ blogs: [rawBlog({ id: 'a' }), rawBlog({ id: 'b' })] });

      expect(result.map(r => r.id)).toEqual(['a', 'b']);
    });
  });

  describe('blog', () => {
    it('should map a blog', () => {
      const blog = rawBlog();

      expect(run({ blogs: [blog] })).toEqual([
        {
          type: 'blog',
          id: 'b1',
          title: 'مقاله',
          slug: 'article',
          description: 'خلاصه',
          image: '/cover.png',
          publishedAt: blog.publishedAt,
          tags: ['موبایل'],
        },
      ]);
    });

    it('should map tags to their names, in order', () => {
      const result = run({
        blogs: [rawBlog({ tags: [{ tag: { name: 'b' } }, { tag: { name: 'a' } }] })],
      });

      expect((result[0] as any).tags).toEqual(['b', 'a']);
    });

    it('should return empty tags when tags is empty, null or undefined', () => {
      for (const tags of [[], null, undefined]) {
        expect((run({ blogs: [rawBlog({ tags })] })[0] as any).tags).toEqual([]);
      }
    });

    it('should pass a null cover image through', () => {
      expect((run({ blogs: [rawBlog({ coverImageUrl: null })] })[0] as any).image).toBeNull();
    });
  });

  describe('product', () => {
    it('should map a product', () => {
      expect(run({ products: [rawProduct()] })).toEqual([
        {
          type: 'product',
          id: 'p1',
          title: 'آیفون',
          slug: 'iphone',
          description: 'توضیحات',
          price: '1000',
          image: '/t.png',
          brand: 'Apple',
          category: 'موبایل',
          subCategory: 'گوشی',
        },
      ]);
    });

    it('should strip HTML tags from the description', () => {
      const [p] = run({ products: [rawProduct({ description: '<p>سلام <b>دنیا</b></p>' })] });

      expect((p as any).description).toBe('سلام دنیا');
    });

    it('should collapse whitespace and trim the description', () => {
      const [p] = run({
        products: [rawProduct({ description: '  a   b \n\n c\t d  ' })],
      });

      expect((p as any).description).toBe('a b c d');
    });

    it('should truncate the description to 50 characters', () => {
      const [p] = run({ products: [rawProduct({ description: 'a'.repeat(120) })] });

      expect((p as any).description).toHaveLength(50);
    });

    it('should keep a description of exactly 50 characters whole', () => {
      const [p] = run({ products: [rawProduct({ description: 'a'.repeat(50) })] });

      expect((p as any).description).toBe('a'.repeat(50));
    });

    it('should return undefined description when it is null or undefined', () => {
      for (const description of [null, undefined]) {
        const [p] = run({ products: [rawProduct({ description })] });
        expect((p as any).description).toBeUndefined();
      }
    });

    it('should return an empty string for an empty description', () => {
      const [p] = run({ products: [rawProduct({ description: '' })] });

      expect((p as any).description).toBe('');
    });

    it('should return null for missing brand, category and subCategory', () => {
      const [p] = run({
        products: [rawProduct({ brand: null, category: null, subCategory: null })],
      }) as any[];

      expect(p.brand).toBeNull();
      expect(p.category).toBeNull();
      expect(p.subCategory).toBeNull();
    });
  });

  describe('category', () => {
    it('should map a category', () => {
      expect(run({ categories: [rawCategory()] })).toEqual([
        {
          type: 'category',
          id: 'c1',
          title: 'موبایل',
          slug: 'mobile',
          icon: 'phone',
          parent: 'دیجیتال',
        },
      ]);
    });

    it('should return null parent for a root category', () => {
      expect((run({ categories: [rawCategory({ parent: null })] })[0] as any).parent).toBeNull();
    });
  });
});
