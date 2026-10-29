// features/search/server/queries.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/prisma-adapter/client', () => ({
  default: {
    blogPost: { findMany: vi.fn() },
    product: { findMany: vi.fn() },
    category: { findMany: vi.fn() },
  },
}));

import prisma from '@/features/prisma-adapter/client';
import { dbSearch } from './queries';

const blogPost = prisma.blogPost as any;
const product = prisma.product as any;
const category = prisma.category as any;

const ci = (q: string) => ({ contains: q, mode: 'insensitive' });

function mockAll(blogs: unknown[] = [], products: unknown[] = [], categories: unknown[] = []) {
  blogPost.findMany.mockResolvedValue(blogs);
  product.findMany.mockResolvedValue(products);
  category.findMany.mockResolvedValue(categories);
}

describe('search/server/queries › dbSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAll();
  });

  describe('ورودی خالی', () => {
    it.each(['', '   ', '\n\t '])(
      'should return empty results for %j without querying',
      async q => {
        expect(await dbSearch(q)).toEqual({ blogs: [], products: [], categories: [] });

        expect(blogPost.findMany).not.toHaveBeenCalled();
        expect(product.findMany).not.toHaveBeenCalled();
        expect(category.findMany).not.toHaveBeenCalled();
      }
    );

    it('should return empty results when query is undefined/null at runtime', async () => {
      expect(await dbSearch(undefined as any)).toEqual({ blogs: [], products: [], categories: [] });
      expect(await dbSearch(null as any)).toEqual({ blogs: [], products: [], categories: [] });
    });
  });

  describe('trim', () => {
    it('should trim the query before using it', async () => {
      await dbSearch('  آیفون  ');

      expect(blogPost.findMany.mock.calls[0][0].where.OR[0]).toEqual({ title: ci('آیفون') });
      expect(product.findMany.mock.calls[0][0].where.OR[0]).toEqual({ title: ci('آیفون') });
      expect(category.findMany.mock.calls[0][0].where.OR[0]).toEqual({ title: ci('آیفون') });
    });
  });

  describe('جستجوی بلاگ', () => {
    it('should search title, excerpt, content and tags (name/slug), case-insensitive', async () => {
      await dbSearch('apple');

      expect(blogPost.findMany.mock.calls[0][0].where).toEqual({
        OR: [
          { title: ci('apple') },
          { excerpt: ci('apple') },
          { content: ci('apple') },
          { tags: { some: { tag: { OR: [{ name: ci('apple') }, { slug: ci('apple') }] } } } },
        ],
      });
    });

    it('should select only safe fields (no content)', async () => {
      await dbSearch('apple');

      const { select } = blogPost.findMany.mock.calls[0][0];
      expect(Object.keys(select).sort()).toEqual(
        ['coverImageUrl', 'excerpt', 'id', 'publishedAt', 'slug', 'tags', 'title'].sort()
      );
      expect(select).not.toHaveProperty('content');
    });

    it('should NOT filter by publish status (see notes)', async () => {
      await dbSearch('apple');

      expect(JSON.stringify(blogPost.findMany.mock.calls[0][0].where)).not.toContain('publishedAt');
    });
  });

  describe('جستجوی محصول', () => {
    it('should search title, description, specs, brand, category and subCategory', async () => {
      await dbSearch('x');

      expect(product.findMany.mock.calls[0][0].where).toEqual({
        OR: [
          { title: ci('x') },
          { description: ci('x') },
          {
            specifications: {
              some: { OR: [{ key: ci('x') }, { value: ci('x') }, { groupName: ci('x') }] },
            },
          },
          { brand: { OR: [{ name: ci('x') }, { slug: ci('x') }] } },
          { category: { OR: [{ title: ci('x') }, { slug: ci('x') }] } },
          { subCategory: { OR: [{ title: ci('x') }, { slug: ci('x') }] } },
        ],
      });
    });

    it('should select the fields needed for the search list', async () => {
      await dbSearch('x');

      const { select } = product.findMany.mock.calls[0][0];
      expect(Object.keys(select).sort()).toEqual(
        [
          'brand',
          'category',
          'description',
          'id',
          'price',
          'slug',
          'subCategory',
          'thumbnail',
          'title',
        ].sort()
      );
    });

    it('should NOT filter by product status (see notes)', async () => {
      await dbSearch('x');

      expect(JSON.stringify(product.findMany.mock.calls[0][0].where)).not.toContain('status');
    });
  });

  describe('جستجوی دسته‌بندی', () => {
    it('should search title, slug, parent and children', async () => {
      await dbSearch('x');

      expect(category.findMany.mock.calls[0][0].where).toEqual({
        OR: [
          { title: ci('x') },
          { slug: ci('x') },
          { parent: { OR: [{ title: ci('x') }, { slug: ci('x') }] } },
          { children: { some: { OR: [{ title: ci('x') }, { slug: ci('x') }] } } },
        ],
      });
    });

    it('should select id, title, slug, icon, parentId and parent', async () => {
      await dbSearch('x');

      const { select } = category.findMany.mock.calls[0][0];
      expect(Object.keys(select).sort()).toEqual(
        ['icon', 'id', 'parent', 'parentId', 'slug', 'title'].sort()
      );
    });
  });

  describe('خروجی و خطا', () => {
    it('should run all three queries once and return their results', async () => {
      const blogs = [{ id: 'b1' }];
      const products = [{ id: 'p1' }, { id: 'p2' }];
      const categories = [{ id: 'c1' }];
      mockAll(blogs, products, categories);

      expect(await dbSearch('x')).toEqual({ blogs, products, categories });
      expect(blogPost.findMany).toHaveBeenCalledTimes(1);
      expect(product.findMany).toHaveBeenCalledTimes(1);
      expect(category.findMany).toHaveBeenCalledTimes(1);
    });

    it('should run the three queries in parallel', async () => {
      let resolveBlogs!: (v: unknown[]) => void;
      blogPost.findMany.mockReturnValue(new Promise(r => (resolveBlogs = r)));

      const promise = dbSearch('x');

      // حتی با pending بودن blogs، دو query دیگر باید شروع شده باشند
      expect(product.findMany).toHaveBeenCalledTimes(1);
      expect(category.findMany).toHaveBeenCalledTimes(1);

      resolveBlogs([]);
      await promise;
    });

    it('should reject if any query fails (no partial results)', async () => {
      product.findMany.mockRejectedValue(new Error('DB error'));

      await expect(dbSearch('x')).rejects.toThrow('DB error');
    });

    it('should pass special characters through unchanged (Prisma parameterizes them)', async () => {
      await dbSearch(`'; DROP TABLE "Product"; --`);

      expect(product.findMany.mock.calls[0][0].where.OR[0]).toEqual({
        title: ci(`'; DROP TABLE "Product"; --`),
      });
    });
  });
});
