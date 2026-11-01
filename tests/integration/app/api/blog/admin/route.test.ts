// @vitest-environment node
// tests/integration/app/api/blog/admin/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('@/features/blog/server/queries', () => ({
  getAdminBlogPosts: vi.fn(),
}));

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getAdminBlogPosts } from '@/features/blog/server/queries';
import { GET } from '@/app/api/blog/admin/route';

const getSession = auth.api.getSession as unknown as ReturnType<typeof vi.fn>;
const getPosts = vi.mocked(getAdminBlogPosts);

const requestHeaders = new Headers({ cookie: 'session=abc' });

describe('GET /api/blog/admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(requestHeaders as any);
    getSession.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
    getPosts.mockResolvedValue([]);
  });

  describe('احراز هویت (401)', () => {
    it('should read the session using the request headers', async () => {
      await GET();

      expect(getSession).toHaveBeenCalledWith({ headers: requestHeaders });
    });

    it('should return 401 when there is no session', async () => {
      getSession.mockResolvedValue(null);

      const res = await GET();

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 when the session has no user', async () => {
      getSession.mockResolvedValue({ user: null });

      expect((await GET()).status).toBe(401);
    });

    it('should NOT query posts when unauthenticated', async () => {
      getSession.mockResolvedValue(null);

      await GET();

      expect(getPosts).not.toHaveBeenCalled();
    });

    it('should log a warning without userId when unauthenticated', async () => {
      getSession.mockResolvedValue(null);

      await GET();

      expect(logger.warn).toHaveBeenCalledWith('GET /api/blog/admin - Unauthorized');
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('مجوز (403)', () => {
    it.each(['USER', 'user', 'admin', 'super_admin', 'EDITOR', '', null, undefined])(
      'should return 403 for role %j (exact match on ADMIN / SUPER_ADMIN only)',
      async role => {
        getSession.mockResolvedValue({ user: { id: 'u1', role } });

        const res = await GET();

        expect(res.status).toBe(403);
        expect(await res.json()).toEqual({ error: 'Forbidden' });
      }
    );

    it('should NOT query posts for a non-admin user', async () => {
      getSession.mockResolvedValue({ user: { id: 'u1', role: 'USER' } });

      await GET();

      expect(getPosts).not.toHaveBeenCalled();
    });

    it('should log a warning with the userId for a forbidden user', async () => {
      getSession.mockResolvedValue({ user: { id: 'u1', role: 'USER' } });

      await GET();

      expect(logger.warn).toHaveBeenCalledWith('GET /api/blog/admin - Forbidden', {
        userId: 'u1',
      });
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('موفق (200)', () => {
    it.each(['ADMIN', 'SUPER_ADMIN'])('should allow role %s', async role => {
      getSession.mockResolvedValue({ user: { id: 'u1', role } });

      expect((await GET()).status).toBe(200);
    });

    it('should return all posts with 200', async () => {
      const posts = [
        { id: 'p1', title: 'منتشرشده', publishedAt: '2025-01-01T00:00:00.000Z' },
        { id: 'p2', title: 'پیش‌نویس', publishedAt: null },
      ];
      getPosts.mockResolvedValue(posts as any);

      const res = await GET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(posts);
    });

    it('should return an empty array when there are no posts', async () => {
      const res = await GET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    });

    it('should call the query exactly once with no arguments', async () => {
      await GET();

      expect(getPosts).toHaveBeenCalledTimes(1);
      expect(getPosts).toHaveBeenCalledWith();
    });

    it('should return JSON', async () => {
      const res = await GET();

      expect(res.headers.get('content-type')).toContain('application/json');
    });

    it('should log success with the count and duration', async () => {
      getPosts.mockResolvedValue([{ id: 'a' }, { id: 'b' }, { id: 'c' }] as any);

      await GET();

      expect(logger.info).toHaveBeenCalledWith('GET /api/blog/admin - Success', {
        count: 3,
        duration: expect.any(Number),
      });
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('خطای داخلی (500)', () => {
    it('should return a generic 500 and NOT leak the error message', async () => {
      getPosts.mockRejectedValue(new Error('connection to db-prod-01 refused'));

      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: 'Internal server error' });
      expect(JSON.stringify(body)).not.toContain('db-prod-01');
    });

    it('should log the error message', async () => {
      getPosts.mockRejectedValue(new Error('DB down'));

      await GET();

      expect(logger.error).toHaveBeenCalledWith('GET /api/blog/admin failed', {
        error: 'DB down',
        duration: expect.any(Number),
      });
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should log "Unknown" for a non-Error throw', async () => {
      getPosts.mockRejectedValue('boom');

      const res = await GET();

      expect(res.status).toBe(500);
      expect(logger.error).toHaveBeenCalledWith(
        'GET /api/blog/admin failed',
        expect.objectContaining({ error: 'Unknown' })
      );
    });

    it('should return 500 when the session lookup throws', async () => {
      getSession.mockRejectedValue(new Error('auth down'));

      const res = await GET();

      expect(res.status).toBe(500);
      expect(getPosts).not.toHaveBeenCalled();
    });

    it('should return 500 when headers() throws', async () => {
      vi.mocked(headers).mockRejectedValue(new Error('no request scope'));

      expect((await GET()).status).toBe(500);
    });
  });
});
