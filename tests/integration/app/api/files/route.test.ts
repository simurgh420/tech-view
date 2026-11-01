// @vitest-environment node
// tests/integration/app/api/files/route.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import { NextRequest } from 'next/server';

vi.mock('node:fs/promises', () => {
  const stat = vi.fn();
  const readFile = vi.fn();
  return { stat, readFile, default: { stat, readFile } };
});

import { stat, readFile } from 'node:fs/promises';
import { GET } from '@/app/api/files/[...path]/route';

const CWD = path.resolve('/app');
const uploadsRoot = path.resolve(CWD, 'public', 'uploads');

// ─── ابزارهای کمکی ───────────────────────────────────────

const call = (...segments: string[]) =>
  GET(new NextRequest('http://localhost/api/files/x'), {
    params: Promise.resolve({ path: segments }),
  });

const bytes = async (res: Response) => [...new Uint8Array(await res.arrayBuffer())];

describe('GET /api/files/[...path]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, 'cwd').mockReturnValue(CWD);
    vi.mocked(stat).mockResolvedValue({} as any);
    vi.mocked(readFile).mockResolvedValue(Buffer.from([1, 2, 3]) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('خواندن موفق', () => {
    it('should return 200 with the file bytes', async () => {
      vi.mocked(readFile).mockResolvedValue(Buffer.from([137, 80, 78, 71]) as any);

      const res = await call('products', 'iphone', 'a.png');

      expect(res.status).toBe(200);
      expect(await bytes(res)).toEqual([137, 80, 78, 71]);
    });

    it('should read the file from public/uploads using the given segments', async () => {
      await call('products', 'iphone', 'a.png');

      const expected = path.resolve(uploadsRoot, 'products', 'iphone', 'a.png');
      expect(stat).toHaveBeenCalledWith(expected);
      expect(readFile).toHaveBeenCalledWith(expected);
    });

    it('should check the file with stat BEFORE reading it', async () => {
      const order: string[] = [];
      vi.mocked(stat).mockImplementation(async () => {
        order.push('stat');
        return {} as any;
      });
      vi.mocked(readFile).mockImplementation(async () => {
        order.push('readFile');
        return Buffer.from([1]) as any;
      });

      await call('a.png');

      expect(order).toEqual(['stat', 'readFile']);
    });

    it('should support a single segment', async () => {
      const res = await call('a.png');

      expect(res.status).toBe(200);
      expect(readFile).toHaveBeenCalledWith(path.resolve(uploadsRoot, 'a.png'));
    });

    it('should support Persian folder names', async () => {
      const res = await call('blogs', 'دنیای-گوشی-های-هوشمند', 'cover', 'a.png');

      expect(res.status).toBe(200);
      expect(readFile).toHaveBeenCalledWith(
        path.resolve(uploadsRoot, 'blogs', 'دنیای-گوشی-های-هوشمند', 'cover', 'a.png')
      );
    });

    it('should allow ".." that stays inside uploads (e.g. a/../b.png)', async () => {
      const res = await call('a', '..', 'b.png');

      expect(res.status).toBe(200);
      expect(readFile).toHaveBeenCalledWith(path.resolve(uploadsRoot, 'b.png'));
    });
  });

  describe('Content-Type', () => {
    it.each([
      ['a.jpg', 'image/jpeg'],
      ['a.jpeg', 'image/jpeg'],
      ['a.png', 'image/png'],
      ['a.webp', 'image/webp'],
    ])('should serve %s as %s', async (file, type) => {
      const res = await call('x', file);

      expect(res.headers.get('Content-Type')).toBe(type);
    });

    it.each(['a.PNG', 'a.JpG', 'a.WEBP'])(
      'should match the extension case-insensitively (%s)',
      async file => {
        const res = await call(file);

        expect(res.headers.get('Content-Type')).toMatch(/^image\//);
      }
    );

    it.each(['a.gif', 'a.svg', 'a.html', 'a.exe', 'a.png.exe', 'noext', '.png'])(
      'should fall back to application/octet-stream for %s',
      async file => {
        const res = await call(file);

        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Type')).toBe('application/octet-stream');
      }
    );
  });

  describe('Cache-Control', () => {
    it('should send a long-lived immutable cache header on success', async () => {
      const res = await call('a.png');

      expect(res.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
    });

    it('should NOT send the immutable header on 404', async () => {
      vi.mocked(stat).mockRejectedValue(new Error('ENOENT'));

      const res = await call('a.png');

      expect(res.headers.get('Cache-Control')).toBeNull();
    });

    it('should NOT send the immutable header on 400', async () => {
      const res = await call('..', '..', '.env');

      expect(res.headers.get('Cache-Control')).toBeNull();
    });
  });

  describe('path traversal (400)', () => {
    it.each([
      [['..', '.env']],
      [['..', '..', 'package.json']],
      [['a', '..', '..', '.env']],
      [['..', '..', '..', 'etc', 'passwd']],
      [['..']],
      [['a', '..', '..']],
    ])('should reject %j', async segments => {
      const res = await call(...segments);

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'Invalid path' });
    });

    it('should NOT touch the filesystem when the path is invalid', async () => {
      await call('..', '..', '.env');

      expect(stat).not.toHaveBeenCalled();
      expect(readFile).not.toHaveBeenCalled();
    });

    it('should reject an absolute segment that escapes uploads', async () => {
      // path.resolve با یک segment مطلق، uploadsRoot را نادیده می‌گیرد
      const res = await call(path.resolve('/etc/passwd'));

      expect(res.status).toBe(400);
      expect(readFile).not.toHaveBeenCalled();
    });

    it('should reject a sibling folder with the same prefix (uploads-evil)', async () => {
      const res = await call('..', 'uploads-evil', 'a.png');

      expect(res.status).toBe(400);
      expect(readFile).not.toHaveBeenCalled();
    });

    it('should reject a path to other public files (e.g. ../img/main.png)', async () => {
      const res = await call('..', 'img', 'main.png');

      expect(res.status).toBe(400);
      expect(readFile).not.toHaveBeenCalled();
    });

    it('should reject the uploads directory itself (empty segments)', async () => {
      const res = await call();

      expect(res.status).toBe(400);
      expect(readFile).not.toHaveBeenCalled();
    });

    it('should reject a path that resolves to the uploads directory (a/..)', async () => {
      const res = await call('a', '..');

      expect(res.status).toBe(400);
      expect(readFile).not.toHaveBeenCalled();
    });
  });

  describe('فایل پیدا نشد (404)', () => {
    it('should return 404 when stat fails (file does not exist)', async () => {
      vi.mocked(stat).mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));

      const res = await call('ghost.png');

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Not found' });
    });

    it('should NOT read the file when stat fails', async () => {
      vi.mocked(stat).mockRejectedValue(new Error('ENOENT'));

      await call('ghost.png');

      expect(readFile).not.toHaveBeenCalled();
    });

    it('should return 404 when the path is a directory (readFile fails with EISDIR)', async () => {
      vi.mocked(readFile).mockRejectedValue(Object.assign(new Error('EISDIR'), { code: 'EISDIR' }));

      const res = await call('products');

      expect(res.status).toBe(404);
    });

    it('should return 404 (not 500) for any other filesystem error, e.g. EACCES (see notes)', async () => {
      vi.mocked(readFile).mockRejectedValue(Object.assign(new Error('EACCES'), { code: 'EACCES' }));

      const res = await call('a.png');

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Not found' });
    });

    it('should NOT leak filesystem error details in the 404 body', async () => {
      vi.mocked(stat).mockRejectedValue(new Error("ENOENT: no such file '/app/public/uploads/x'"));

      const body = JSON.stringify(await (await call('x.png')).json());

      expect(body).not.toContain('/app');
      expect(body).not.toContain('ENOENT');
    });
  });
});
