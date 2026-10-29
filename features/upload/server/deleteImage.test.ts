// features/upload/server/deleteImage.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'node:path';

vi.mock('node:fs/promises', () => {
  const rm = vi.fn();
  return {
    rm,
    default: { rm },
  };
});

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { rm } from 'node:fs/promises';
import { logger } from '@/lib/logger';
import { deleteImage } from './deleteImage';

const CWD = path.resolve('/app');
const uploadsRoot = path.resolve(CWD, 'public', 'uploads');

describe('upload/server/deleteImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, 'cwd').mockReturnValue(CWD);
    vi.mocked(rm).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('حذف موفق', () => {
    it('should delete a file inside public/uploads and return true', async () => {
      const result = await deleteImage('/uploads/products/a.png');

      expect(result).toBe(true);
      expect(rm).toHaveBeenCalledTimes(1);
      expect(rm).toHaveBeenCalledWith(path.resolve(uploadsRoot, 'products', 'a.png'), {
        force: true,
      });
    });

    it('should accept a path without a leading slash', async () => {
      expect(await deleteImage('uploads/a.png')).toBe(true);
      expect(rm).toHaveBeenCalledWith(path.resolve(uploadsRoot, 'a.png'), { force: true });
    });

    it('should support Persian folder names', async () => {
      const result = await deleteImage('/uploads/blogs/دنیای-گوشی-های-هوشمند/cover/a.jpg');

      expect(result).toBe(true);
      expect(rm).toHaveBeenCalledWith(
        path.resolve(uploadsRoot, 'blogs', 'دنیای-گوشی-های-هوشمند', 'cover', 'a.jpg'),
        { force: true }
      );
    });

    it('should log success with path and full path', async () => {
      await deleteImage('/uploads/a.png');

      expect(logger.info).toHaveBeenCalledWith(
        'deleteImage success',
        expect.objectContaining({
          imagePath: '/uploads/a.png',
          fullPath: path.resolve(uploadsRoot, 'a.png'),
          duration: expect.any(Number),
        })
      );
    });

    it('should return true even if the file does not exist (force: true)', async () => {
      // rm با force روی فایل ناموجود خطا نمی‌دهد
      vi.mocked(rm).mockResolvedValue(undefined);

      expect(await deleteImage('/uploads/ghost.png')).toBe(true);
    });
  });

  describe('ورودی نامعتبر', () => {
    it.each([
      ['', 'empty string'],
      [null, 'null'],
      [undefined, 'undefined'],
      [123, 'number'],
      [{}, 'object'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ])('should return false for %j (%s)', async (input, _description) => {
      expect(await deleteImage(input as any)).toBe(false);

      expect(rm).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        'deleteImage: invalid imagePath',
        expect.any(Object)
      );
    });

    it.each(['/', '//'])('should handle %j without deleting anything', async input => {
      const result = await deleteImage(input);

      expect(result).toBe(false);
      expect(rm).not.toHaveBeenCalled();
    });

    it('should return false for a lone "/" with the "empty path" warning', async () => {
      await deleteImage('/');

      expect(logger.warn).toHaveBeenCalledWith(
        'deleteImage: empty path after cleaning',
        expect.objectContaining({ imagePath: '/' })
      );
    });
  });

  describe('path traversal', () => {
    it.each([
      '/uploads/../.env',
      '../.env',
      '/uploads/../../package.json',
      'uploads/a/../../../etc/passwd',
      '/uploads/..',
    ])('should reject %j', async input => {
      expect(await deleteImage(input)).toBe(false);

      expect(rm).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        'deleteImage: path traversal detected',
        expect.objectContaining({ imagePath: input })
      );
    });

    it('should also reject harmless names containing ".." (e.g. "a..b.png")', async () => {
      // رفتار فعلی: بررسی ساده includes است، پس نام‌های بی‌خطر هم رد می‌شوند
      expect(await deleteImage('/uploads/a..b.png')).toBe(false);
      expect(rm).not.toHaveBeenCalled();
    });
  });

  describe('محدودیت به public/uploads', () => {
    it.each(['/favicon.ico', '/img/main.png', '/Image-not-found.png', 'faq/faqbaner.png'])(
      'should refuse to delete %j (outside uploads)',
      async input => {
        expect(await deleteImage(input)).toBe(false);

        expect(rm).not.toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith(
          'deleteImage: resolved path outside uploads directory',
          expect.objectContaining({ imagePath: input })
        );
      }
    );

    it('should refuse to delete the uploads directory itself', async () => {
      expect(await deleteImage('/uploads')).toBe(false);
      expect(await deleteImage('/uploads/')).toBe(false);

      expect(rm).not.toHaveBeenCalled();
    });

    it('should refuse a sibling folder with the same prefix (uploads-evil)', async () => {
      expect(await deleteImage('/uploads-evil/a.png')).toBe(false);

      expect(rm).not.toHaveBeenCalled();
    });

    it('should refuse a path that merely starts with "public/"', async () => {
      // /public/uploads/a.png → public/public/uploads/a.png (خارج از uploads)
      expect(await deleteImage('/public/uploads/a.png')).toBe(false);

      expect(rm).not.toHaveBeenCalled();
    });
  });

  describe('خطای فایل‌سیستم', () => {
    it('should return false and log when rm throws (e.g. EACCES)', async () => {
      vi.mocked(rm).mockRejectedValue(new Error('EACCES: permission denied'));

      expect(await deleteImage('/uploads/a.png')).toBe(false);

      expect(logger.error).toHaveBeenCalledWith(
        'deleteImage failed',
        expect.objectContaining({
          imagePath: '/uploads/a.png',
          error: 'EACCES: permission denied',
          duration: expect.any(Number),
        })
      );
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should log "Unknown" when a non-Error is thrown', async () => {
      vi.mocked(rm).mockRejectedValue('boom');

      expect(await deleteImage('/uploads/a.png')).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        'deleteImage failed',
        expect.objectContaining({ error: 'Unknown' })
      );
    });

    it('should never throw (always resolves to a boolean)', async () => {
      vi.mocked(rm).mockRejectedValue(new Error('x'));

      await expect(deleteImage('/uploads/a.png')).resolves.toBe(false);
    });
  });
});
