// @vitest-environment node
// tests/integration/app/api/product-comments/admin/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('@/features/product-comments/server/queries', () => ({
  getAllCommentsAdmin: vi.fn(),
}));

import { logger } from '@/lib/logger';
import { getAllCommentsAdmin } from '@/features/product-comments/server/queries';
import { GET } from '@/app/api/product-comments/admin/route';

const getAll = vi.mocked(getAllCommentsAdmin);

describe('GET /api/product-comments/admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAll.mockResolvedValue([]);
  });

  describe('دسترسی', () => {
    // ⚠️ این تست یک حفره‌ی امنیتی را ثبت می‌کند، نه رفتار مطلوب را.
    it('SECURITY: currently requires NO authentication at all (see notes)', async () => {
      // هیچ session، هیچ permission و هیچ mock احراز هویتی تنظیم نشده
      const res = await GET();

      expect(res.status).toBe(200);
      expect(getAll).toHaveBeenCalledTimes(1);
    });

    it.todo('should return 401 without a session');
    it.todo('should return 403 for a user without the moderation permission');
    it.todo('should NOT query comments when unauthenticated or forbidden');
    it.todo('should allow ADMIN / SUPER_ADMIN');
  });

  describe('موفق', () => {
    it('should return all comments with 200', async () => {
      const comments = [
        { id: 'c1', status: 'PENDING' },
        { id: 'c2', status: 'APPROVED' },
        { id: 'c3', status: 'REJECTED' },
      ];
      getAll.mockResolvedValue(comments as any);

      const res = await GET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(comments);
    });

    it('should return an empty array when there are no comments', async () => {
      const res = await GET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    });

    it('should call the query exactly once with no arguments', async () => {
      await GET();

      expect(getAll).toHaveBeenCalledWith();
    });

    it('should NOT log anything on success (unlike the other routes)', async () => {
      await GET();

      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('خطا (500)', () => {
    it('should return a generic Persian message under "message" (not "error")', async () => {
      getAll.mockRejectedValue(new Error('connection to db-prod-01 refused'));

      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ message: 'خطا در دریافت دیدگاه‌های محصولات' });
      expect(JSON.stringify(body)).not.toContain('db-prod-01');
    });

    it('should log the error (without duration)', async () => {
      getAll.mockRejectedValue(new Error('DB down'));

      await GET();

      expect(logger.error).toHaveBeenCalledWith('GET /api/product-comments/admin failed', {
        error: 'DB down',
      });
    });

    it('should log "Unknown" for a non-Error throw', async () => {
      getAll.mockRejectedValue('boom');

      expect((await GET()).status).toBe(500);
      expect(logger.error).toHaveBeenCalledWith('GET /api/product-comments/admin failed', {
        error: 'Unknown',
      });
    });
  });
});
