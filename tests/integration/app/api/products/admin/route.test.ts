// @vitest-environment node
// tests/integration/app/api/products/admin/route.test.ts
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

vi.mock('@/features/products/server/queries', () => ({
  getAdminProducts: vi.fn(),
}));

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getAdminProducts } from '@/features/products/server/queries';
import { GET } from '@/app/api/products/admin/route';

const getSession = auth.api.getSession as unknown as ReturnType<typeof vi.fn>;
const getProducts = vi.mocked(getAdminProducts);

const requestHeaders = new Headers({ cookie: 'session=abc' });

describe('GET /api/products/admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(requestHeaders as any);
    getSession.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
    getProducts.mockResolvedValue([]);
  });

  describe('احراز هویت (401)', () => {
    it('should read the session using the request headers', async () => {
      await GET();

      expect(getSession).toHaveBeenCalledWith({ headers: requestHeaders });
    });

    it.each([[null], [{ user: null }]])('should return 401 for session %j', async session => {
      getSession.mockResolvedValue(session);

      const res = await GET();

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should NOT query products when unauthenticated', async () => {
      getSession.mockResolvedValue(null);

      await GET();

      expect(getProducts).not.toHaveBeenCalled();
    });

    it('should log a warning without extra data when unauthenticated', async () => {
      getSession.mockResolvedValue(null);

      await GET();

      expect(logger.warn).toHaveBeenCalledWith('GET /api/products/admin - Unauthorized');
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

    it('should NOT query products for a non-admin user', async () => {
      getSession.mockResolvedValue({ user: { id: 'u1', role: 'USER' } });

      await GET();

      expect(getProducts).not.toHaveBeenCalled();
    });

    it('should log a warning with the userId for a forbidden user', async () => {
      getSession.mockResolvedValue({ user: { id: 'u1', role: 'USER' } });

      await GET();

      expect(logger.warn).toHaveBeenCalledWith('GET /api/products/admin - Forbidden', {
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

    it('should return all products (including drafts) with 200', async () => {
      const products = [
        { id: 'p1', title: 'منتشرشده', status: 'PUBLISHED' },
        { id: 'p2', title: 'پیش‌نویس', status: 'DRAFT' },
      ];
      getProducts.mockResolvedValue(products as any);

      const res = await GET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(products);
    });

    it('should return an empty array when there are no products', async () => {
      const res = await GET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    });

    it('should call the query exactly once with no arguments', async () => {
      await GET();

      expect(getProducts).toHaveBeenCalledTimes(1);
      expect(getProducts).toHaveBeenCalledWith();
    });

    it('should return JSON', async () => {
      const res = await GET();

      expect(res.headers.get('content-type')).toContain('application/json');
    });

    it('should log success with count and duration', async () => {
      getProducts.mockResolvedValue([{ id: 'a' }, { id: 'b' }, { id: 'c' }] as any);

      await GET();

      expect(logger.info).toHaveBeenCalledWith('GET /api/products/admin - Success', {
        count: 3,
        duration: expect.any(Number),
      });
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('خطای داخلی (500)', () => {
    it('should return a generic 500 and NOT leak the error message', async () => {
      getProducts.mockRejectedValue(new Error('connection to db-prod-01 refused'));

      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: 'Internal server error' });
      expect(JSON.stringify(body)).not.toContain('db-prod-01');
    });

    it('should log the error message', async () => {
      getProducts.mockRejectedValue(new Error('DB down'));

      await GET();

      expect(logger.error).toHaveBeenCalledWith('GET /api/products/admin failed', {
        error: 'DB down',
        duration: expect.any(Number),
      });
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should log "Unknown" for a non-Error throw', async () => {
      getProducts.mockRejectedValue('boom');

      expect((await GET()).status).toBe(500);
      expect(logger.error).toHaveBeenCalledWith(
        'GET /api/products/admin failed',
        expect.objectContaining({ error: 'Unknown' })
      );
    });

    it('should return 500 when the session lookup throws', async () => {
      getSession.mockRejectedValue(new Error('auth down'));

      const res = await GET();

      expect(res.status).toBe(500);
      expect(getProducts).not.toHaveBeenCalled();
    });

    it('should return 500 when headers() throws', async () => {
      vi.mocked(headers).mockRejectedValue(new Error('no request scope'));

      expect((await GET()).status).toBe(500);
    });
  });
});
