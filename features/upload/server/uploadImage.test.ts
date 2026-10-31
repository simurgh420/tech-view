// @vitest-environment node
// features/upload/server/uploadImage.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'node:path';

vi.mock('node:fs/promises', () => {
  const mkdir = vi.fn();
  const writeFile = vi.fn();
  return { mkdir, writeFile, default: { mkdir, writeFile } };
});

vi.mock('node:crypto', () => {
  const randomUUID = vi.fn();
  return { randomUUID, default: { randomUUID } };
});

vi.mock('file-type', () => ({
  fileTypeFromBuffer: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { mkdir, writeFile } from 'node:fs/promises';
import crypto from 'node:crypto';
import { fileTypeFromBuffer } from 'file-type';
import { logger } from '@/lib/logger';
import { uploadImage } from './uploadImage';

const CWD = path.resolve('/app');
const uploadsRoot = path.resolve(CWD, 'public', 'uploads');

const MB = 1024 * 1024;

/** یک File واقعی با محتوا و نوع دلخواه می‌سازد */
function createFile(
  overrides: { name?: string; type?: string; size?: number; content?: Uint8Array } = {}
) {
  const { name = 'photo.png', type = 'image/png', content } = overrides;
  const bytes = content ?? new Uint8Array(overrides.size ?? 100).fill(1);
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new File([buffer], name, { type });
}

function mockDetected(ext = 'png', mime = 'image/png') {
  vi.mocked(fileTypeFromBuffer).mockResolvedValue({ ext, mime } as any);
}

describe('upload/server/uploadImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, 'cwd').mockReturnValue(CWD);
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);
    vi.mocked(crypto.randomUUID).mockReturnValue('abcd1234-0000-0000-0000-000000000000');
    mockDetected();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('آپلود موفق', () => {
    it('should write the file and return a relative URL', async () => {
      const url = await uploadImage(createFile({ name: 'photo.png' }), 'products/iphone');

      expect(url).toBe('/uploads/products/iphone/photo-abcd1234.png');
      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(vi.mocked(writeFile).mock.calls[0][0]).toBe(
        path.join(uploadsRoot, 'products', 'iphone', 'photo-abcd1234.png')
      );
    });

    it('should write the exact file bytes', async () => {
      const content = new Uint8Array([1, 2, 3, 4, 5]);

      await uploadImage(createFile({ content }), 'a');

      const written = vi.mocked(writeFile).mock.calls[0][1] as Buffer;
      expect(Buffer.isBuffer(written)).toBe(true);
      expect([...written]).toEqual([1, 2, 3, 4, 5]);
    });

    it('should create the target directory recursively', async () => {
      await uploadImage(createFile(), 'products/iphone');

      expect(mkdir).toHaveBeenCalledWith(path.resolve(uploadsRoot, 'products', 'iphone'), {
        recursive: true,
      });
    });

    it('should create the directory BEFORE writing the file', async () => {
      const order: string[] = [];
      vi.mocked(mkdir).mockImplementation(async () => {
        order.push('mkdir');
        return undefined;
      });
      vi.mocked(writeFile).mockImplementation(async () => {
        order.push('writeFile');
      });

      await uploadImage(createFile(), 'a');

      expect(order).toEqual(['mkdir', 'writeFile']);
    });

    it('should log success with size and detected mime', async () => {
      await uploadImage(createFile({ size: 250 }), 'a');

      expect(logger.info).toHaveBeenCalledWith(
        'uploadImage success',
        expect.objectContaining({
          folder: 'a',
          fileName: 'photo-abcd1234.png',
          size: 250,
          detectedMime: 'image/png',
          duration: expect.any(Number),
        })
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it.each([
      ['image/jpeg', 'jpg', 'image/jpeg'],
      ['image/png', 'png', 'image/png'],
      ['image/webp', 'webp', 'image/webp'],
    ])('should accept declared type %s', async (type, ext, mime) => {
      mockDetected(ext, mime);

      const url = await uploadImage(createFile({ type, name: 'x.bin' }), 'a');

      expect(url.endsWith(`.${ext}`)).toBe(true);
    });

    it('should accept a file of exactly 5MB', async () => {
      await expect(uploadImage(createFile({ size: 5 * MB }), 'a')).resolves.toBeTypeOf('string');
    });
  });

  describe('اعتبارسنجی اولیه', () => {
    it('should reject when file is missing', async () => {
      await expect(uploadImage(undefined as any, 'a')).rejects.toThrow(
        'فایل و پوشه مقصد الزامی است'
      );
      expect(writeFile).not.toHaveBeenCalled();
    });

    it('should reject when folder is empty', async () => {
      await expect(uploadImage(createFile(), '')).rejects.toThrow('فایل و پوشه مقصد الزامی است');
      expect(writeFile).not.toHaveBeenCalled();
    });

    it('should reject files larger than 5MB', async () => {
      await expect(uploadImage(createFile({ size: 5 * MB + 1 }), 'a')).rejects.toThrow(
        'حجم فایل نباید بیشتر از ۵ مگابایت باشد'
      );
      expect(mkdir).not.toHaveBeenCalled();
      expect(writeFile).not.toHaveBeenCalled();
    });

    it('should reject empty files', async () => {
      await expect(uploadImage(createFile({ content: new Uint8Array(0) }), 'a')).rejects.toThrow(
        'فایل خالی است'
      );
      expect(writeFile).not.toHaveBeenCalled();
    });

    it.each(['image/gif', 'image/svg+xml', 'application/pdf', 'text/html', ''])(
      'should reject declared MIME type %j',
      async type => {
        await expect(uploadImage(createFile({ type }), 'a')).rejects.toThrow('نوع فایل مجاز نیست');
        expect(fileTypeFromBuffer).not.toHaveBeenCalled();
        expect(writeFile).not.toHaveBeenCalled();
      }
    );
  });

  describe('محدودیت پوشه', () => {
    it.each(['../x', 'a/../../b', '..', 'a/..'])(
      'should reject folder %j (path traversal)',
      async folder => {
        await expect(uploadImage(createFile(), folder)).rejects.toThrow('نام پوشه نامعتبر است');
        expect(mkdir).not.toHaveBeenCalled();
        expect(writeFile).not.toHaveBeenCalled();
      }
    );

    it.each(['.', './', '/'])(
      'should reject folder %j that resolves to the uploads root itself',
      async folder => {
        await expect(uploadImage(createFile(), folder)).rejects.toThrow(
          'مسیر ذخیره‌سازی نامعتبر است'
        );
        expect(writeFile).not.toHaveBeenCalled();
      }
    );

    it('should reject an absolute folder outside uploads', async () => {
      // path.resolve با مسیر مطلق، uploadsRoot را نادیده می‌گیرد
      const outside = path.resolve('/etc/evil');

      await expect(uploadImage(createFile(), outside)).rejects.toThrow(
        'مسیر ذخیره‌سازی نامعتبر است'
      );
      expect(mkdir).not.toHaveBeenCalled();
      expect(writeFile).not.toHaveBeenCalled();
    });

    it('should accept nested Persian folder names', async () => {
      const url = await uploadImage(createFile(), 'blogs/دنیای-گوشی/cover');

      expect(url).toBe('/uploads/blogs/دنیای-گوشی/cover/photo-abcd1234.png');
    });
  });

  describe('تشخیص نوع واقعی (magic bytes)', () => {
    it('should reject when file content type cannot be detected', async () => {
      vi.mocked(fileTypeFromBuffer).mockResolvedValue(undefined);

      await expect(uploadImage(createFile(), 'a')).rejects.toThrow(
        'محتوای فایل با نوع تصویر مجاز مطابقت ندارد'
      );
      expect(mkdir).not.toHaveBeenCalled();
      expect(writeFile).not.toHaveBeenCalled();
    });

    it.each([
      ['gif', 'image/gif'],
      ['svg', 'image/svg+xml'],
      ['pdf', 'application/pdf'],
      ['exe', 'application/x-msdownload'],
    ])('should reject a fake image whose real content is %s', async (ext, mime) => {
      // کلاینت MIME را image/png اعلام کرده، ولی محتوا چیز دیگری است
      mockDetected(ext, mime);

      await expect(uploadImage(createFile({ type: 'image/png' }), 'a')).rejects.toThrow(
        'محتوای فایل با نوع تصویر مجاز مطابقت ندارد'
      );
      expect(writeFile).not.toHaveBeenCalled();
    });

    it('should log a warning with declared and detected types on mismatch', async () => {
      mockDetected('gif', 'image/gif');

      await expect(uploadImage(createFile({ type: 'image/png' }), 'a')).rejects.toThrow();

      expect(logger.warn).toHaveBeenCalledWith(
        'uploadImage: content type mismatch or unsupported',
        {
          folder: 'a',
          declaredMime: 'image/png',
          detectedMime: 'image/gif',
          detectedExt: 'gif',
        }
      );
    });

    it('should use the REAL extension (from content), not the one in the file name', async () => {
      // اسم .png است ولی محتوا jpg است
      mockDetected('jpg', 'image/jpeg');

      const url = await uploadImage(createFile({ name: 'fake.png', type: 'image/png' }), 'a');

      expect(url).toBe('/uploads/a/fake-abcd1234.jpg');
    });

    it('should pass the file bytes to the detector', async () => {
      const content = new Uint8Array([9, 8, 7]);

      await uploadImage(createFile({ content }), 'a');

      const arg = vi.mocked(fileTypeFromBuffer).mock.calls[0][0] as Buffer;
      expect([...arg]).toEqual([9, 8, 7]);
    });
  });

  describe('نام فایل', () => {
    it('should use the cleaned file name when baseName is not given', async () => {
      const url = await uploadImage(createFile({ name: 'my photo.png' }), 'a');

      expect(url).toBe('/uploads/a/my-photo-abcd1234.png');
    });

    it('should only use the part before the first dot of the file name', async () => {
      const url = await uploadImage(createFile({ name: 'a.b.c.png' }), 'a');

      expect(url).toBe('/uploads/a/a-abcd1234.png');
    });

    it('should fall back to "image" when the file name has no valid characters', async () => {
      const url = await uploadImage(createFile({ name: 'عکس.png' }), 'a');

      expect(url).toBe('/uploads/a/image-abcd1234.png');
    });

    it('should drop uppercase letters from the file name (no lowercase step without baseName)', async () => {
      // رفتار فعلی: بدون baseName حروف بزرگ حذف می‌شوند، نه کوچک
      const url = await uploadImage(createFile({ name: 'IMG-Photo.png' }), 'a');

      expect(url).toBe('/uploads/a/hoto-abcd1234.png');
    });

    it('should fall back to "image" for a name that starts with a dot', async () => {
      const url = await uploadImage(createFile({ name: '.png' }), 'a');

      expect(url).toBe('/uploads/a/image-abcd1234.png');
    });

    it('should use baseName when provided (lowercased and slugified)', async () => {
      const url = await uploadImage(createFile({ name: 'ignored.png' }), 'a', 'My Product 01');

      expect(url).toBe('/uploads/a/my-product-01-abcd1234.png');
    });

    it('should trim leading/trailing dashes from baseName', async () => {
      const url = await uploadImage(createFile(), 'a', '--hello--');

      expect(url).toBe('/uploads/a/hello-abcd1234.png');
    });

    it('should fall back to "image" when baseName has only invalid characters', async () => {
      const url = await uploadImage(createFile(), 'a', 'گوشی');

      expect(url).toBe('/uploads/a/image-abcd1234.png');
    });

    it('should ignore a whitespace-only baseName and use the file name', async () => {
      const url = await uploadImage(createFile({ name: 'real.png' }), 'a', '   ');

      expect(url).toBe('/uploads/a/real-abcd1234.png');
    });

    it('should neutralize traversal characters in baseName', async () => {
      const url = await uploadImage(createFile(), 'a', '../../etc/passwd');

      expect(url).toBe('/uploads/a/etc-passwd-abcd1234.png');
      expect(vi.mocked(writeFile).mock.calls[0][0]).toBe(
        path.join(uploadsRoot, 'a', 'etc-passwd-abcd1234.png')
      );
    });

    it('should use the first segment of the UUID as a unique suffix', async () => {
      vi.mocked(crypto.randomUUID).mockReturnValue('deadbeef-1111-2222-3333-444444444444');

      const url = await uploadImage(createFile(), 'a', 'x');

      expect(url).toBe('/uploads/a/x-deadbeef.png');
    });
  });

  describe('خطای فایل‌سیستم', () => {
    it('should log and rethrow when mkdir fails', async () => {
      const error = new Error('EACCES');
      vi.mocked(mkdir).mockRejectedValue(error);

      await expect(uploadImage(createFile(), 'a')).rejects.toBe(error);

      expect(writeFile).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        'uploadImage failed',
        expect.objectContaining({ folder: 'a', error: 'EACCES' })
      );
    });

    it('should log and rethrow when writeFile fails', async () => {
      const error = new Error('ENOSPC: no space left');
      vi.mocked(writeFile).mockRejectedValue(error);

      await expect(uploadImage(createFile(), 'a')).rejects.toBe(error);

      expect(logger.error).toHaveBeenCalledWith(
        'uploadImage failed',
        expect.objectContaining({ error: 'ENOSPC: no space left' })
      );
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should log "Unknown" when a non-Error is thrown', async () => {
      vi.mocked(writeFile).mockRejectedValue('boom');

      await expect(uploadImage(createFile(), 'a')).rejects.toBe('boom');
      expect(logger.error).toHaveBeenCalledWith(
        'uploadImage failed',
        expect.objectContaining({ error: 'Unknown' })
      );
    });
  });

  describe('لاگ خطا', () => {
    it('should log validation errors with folder and baseName', async () => {
      await expect(
        uploadImage(createFile({ type: 'image/gif' }), 'a', 'my-base')
      ).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        'uploadImage failed',
        expect.objectContaining({
          folder: 'a',
          baseName: 'my-base',
          error: 'نوع فایل مجاز نیست',
          duration: expect.any(Number),
        })
      );
    });
  });
});
