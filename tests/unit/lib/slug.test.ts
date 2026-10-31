// lib/server/slug.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/prisma-adapter/client', () => ({
  default: {
    blogPost: { findFirst: vi.fn() },
  },
}));

import prisma from '@/features/prisma-adapter/client';
import { generateUniqueSlug } from '@/lib/server/slug';

const findFirst = prisma.blogPost.findFirst as unknown as ReturnType<typeof vi.fn>;

/** findFirst را طوری تنظیم می‌کند که فقط برای slugهای داده‌شده رکورد برگرداند */
function takeSlugs(taken: string[]) {
  const set = new Set(taken);
  findFirst.mockImplementation(async ({ where }: { where: { slug: string } }) =>
    set.has(where.slug) ? { id: 'existing' } : null
  );
}

/** base, base-1, ..., base-(n-1) */
const takenUpTo = (base: string, n: number) => [
  base,
  ...Array.from({ length: n - 1 }, (_, i) => `${base}-${i + 1}`),
];

const queriedSlugs = () => findFirst.mock.calls.map(([arg]) => arg.where.slug);

describe('lib/server/slug › generateUniqueSlug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    takeSlugs([]);
  });

  describe('slug آزاد', () => {
    it('should return the base slug when it is free', async () => {
      expect(await generateUniqueSlug('my-post')).toBe('my-post');
    });

    it('should query only once when the base slug is free', async () => {
      await generateUniqueSlug('my-post');

      expect(findFirst).toHaveBeenCalledTimes(1);
    });

    it('should query by slug only when excludeId is not given', async () => {
      await generateUniqueSlug('my-post');

      expect(findFirst).toHaveBeenCalledWith({ where: { slug: 'my-post' } });
    });

    it('should keep Persian slugs unchanged', async () => {
      expect(await generateUniqueSlug('دنیای-گوشی-های-هوشمند')).toBe('دنیای-گوشی-های-هوشمند');
    });
  });

  describe('excludeId', () => {
    it('should exclude the given id from the lookup', async () => {
      await generateUniqueSlug('my-post', 'post-1');

      expect(findFirst).toHaveBeenCalledWith({
        where: { slug: 'my-post', id: { not: 'post-1' } },
      });
    });

    it('should exclude the id on every attempt', async () => {
      takeSlugs(['my-post', 'my-post-1']);

      await generateUniqueSlug('my-post', 'post-1');

      expect(findFirst).toHaveBeenCalledTimes(3);
      for (const [arg] of findFirst.mock.calls) {
        expect(arg.where.id).toEqual({ not: 'post-1' });
      }
    });

    it('should NOT add an id filter when excludeId is an empty string', async () => {
      await generateUniqueSlug('my-post', '');

      expect(findFirst.mock.calls[0][0].where).toEqual({ slug: 'my-post' });
    });
  });

  describe('slug اشغال‌شده', () => {
    it('should append -1 when the base slug is taken', async () => {
      takeSlugs(['my-post']);

      expect(await generateUniqueSlug('my-post')).toBe('my-post-1');
    });

    it('should append -2 when the base and -1 are taken', async () => {
      takeSlugs(['my-post', 'my-post-1']);

      expect(await generateUniqueSlug('my-post')).toBe('my-post-2');
    });

    it('should skip gaps correctly (finds the first free number)', async () => {
      // my-post-2 آزاد است، حتی اگر my-post-3 اشغال باشد
      takeSlugs(['my-post', 'my-post-1', 'my-post-3']);

      expect(await generateUniqueSlug('my-post')).toBe('my-post-2');
    });

    it('should query candidates in order: base, -1, -2, ...', async () => {
      takeSlugs(['my-post', 'my-post-1', 'my-post-2']);

      await generateUniqueSlug('my-post');

      expect(queriedSlugs()).toEqual(['my-post', 'my-post-1', 'my-post-2', 'my-post-3']);
    });

    it('should always build suffixes from the ORIGINAL base slug (no -1-2 chaining)', async () => {
      takeSlugs(takenUpTo('my-post', 5));

      await generateUniqueSlug('my-post');

      expect(queriedSlugs().some(s => s.includes('-1-'))).toBe(false);
    });

    it('should treat a base slug that already ends with a number as plain text', async () => {
      takeSlugs(['iphone-15']);

      expect(await generateUniqueSlug('iphone-15')).toBe('iphone-15-1');
    });

    it('should not touch other slugs that merely share a prefix', async () => {
      takeSlugs(['my-post-extra']);

      expect(await generateUniqueSlug('my-post')).toBe('my-post');
    });
  });

  describe('محدودیت تعداد تلاش', () => {
    it('should succeed on the 49th attempt (suffix -48)', async () => {
      takeSlugs(takenUpTo('my-post', 48)); // base + -1..-47

      expect(await generateUniqueSlug('my-post')).toBe('my-post-48');
      expect(findFirst).toHaveBeenCalledTimes(49);
    });

    it('should succeed on the last allowed attempt (the 50th, suffix -49)', async () => {
      takeSlugs(takenUpTo('my-post', 49)); // base + -1..-48

      expect(await generateUniqueSlug('my-post')).toBe('my-post-49');
      expect(findFirst).toHaveBeenCalledTimes(50);
    });

    it('should succeed with the last allowed candidate, my-post-49', async () => {
      takeSlugs(
        takenUpTo('my-post', 49)
          .concat('my-post-48')
          .filter((s, i, a) => a.indexOf(s) === i)
      );

      expect(await generateUniqueSlug('my-post')).toBe('my-post-49');
      expect(findFirst).toHaveBeenCalledTimes(50);
    });

    it('should throw after 50 attempts when all candidates are taken', async () => {
      takeSlugs(takenUpTo('my-post', 50)); // base + -1..-49

      await expect(generateUniqueSlug('my-post')).rejects.toThrow(
        'Unable to generate unique slug for "my-post" after 50 attempts'
      );
      expect(findFirst).toHaveBeenCalledTimes(50);
    });

    it('should never query a candidate beyond -49 (the -50 candidate is never checked)', async () => {
      takeSlugs(takenUpTo('my-post', 50));

      await expect(generateUniqueSlug('my-post')).rejects.toThrow();

      expect(queriedSlugs()).not.toContain('my-post-50');
      expect(queriedSlugs().at(-1)).toBe('my-post-49');
    });

    it('should include the base slug in the error message', async () => {
      takeSlugs(takenUpTo('another', 50));

      await expect(generateUniqueSlug('another')).rejects.toThrow('"another"');
    });
  });

  describe('خطای دیتابیس', () => {
    it('should propagate prisma errors unchanged', async () => {
      const error = new Error('DB down');
      findFirst.mockRejectedValue(error);

      await expect(generateUniqueSlug('my-post')).rejects.toBe(error);
    });

    it('should stop querying after the first failure', async () => {
      findFirst.mockRejectedValue(new Error('DB down'));

      await expect(generateUniqueSlug('my-post')).rejects.toThrow();

      expect(findFirst).toHaveBeenCalledTimes(1);
    });

    it('should propagate an error that happens on a later attempt', async () => {
      findFirst.mockResolvedValueOnce({ id: 'x' }).mockRejectedValueOnce(new Error('timeout'));

      await expect(generateUniqueSlug('my-post')).rejects.toThrow('timeout');
      expect(findFirst).toHaveBeenCalledTimes(2);
    });
  });

  describe('ورودی‌های مرزی', () => {
    it('should return an empty string as-is when it is free (see notes)', async () => {
      expect(await generateUniqueSlug('')).toBe('');
    });

    it('should build "-1" candidates from an empty base when it is taken (see notes)', async () => {
      takeSlugs(['']);

      expect(await generateUniqueSlug('')).toBe('-1');
    });
  });
});
