// @vitest-environment node
// tests/integration/app/api/admin/orders/route.test.ts
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

vi.mock('@/features/orders/server/queries', () => ({
  getAdminOrdersDB: vi.fn(),
}));

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getAdminOrdersDB } from '@/features/orders/server/queries';
import { GET } from '@/app/api/admin/orders/route';

const getSession = auth.api.getSession as unknown as ReturnType<typeof vi.fn>;
const getOrders = vi.mocked(getAdminOrdersDB);

const requestHeaders = new Headers({ cookie: 'session=abc' });

describe('GET /api/admin/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(requestHeaders as any);
    getSession.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
    getOrders.mockResolvedValue([]);
  });

  describe('دسترسی', () => {
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

    it.each(['USER', 'user', 'admin', 'super_admin', '', null, undefined])(
      'should return 401 for role %j (exact match on ADMIN / SUPER_ADMIN only)',
      async role => {
        getSession.mockResolvedValue({ user: { id: 'u1', role } });

        const res = await GET();

        expect(res.status).toBe(401);
        expect(getOrders).not.toHaveBeenCalled();
      }
    );

    it.each(['ADMIN', 'SUPER_ADMIN'])('should allow role %s', async role => {
      getSession.mockResolvedValue({ user: { id: 'u1', role } });

      expect((await GET()).status).toBe(200);
    });

    it('should NOT query orders when unauthorized', async () => {
      getSession.mockResolvedValue(null);

      await GET();

      expect(getOrders).not.toHaveBeenCalled();
    });

    it('should log a warning when unauthorized', async () => {
      getSession.mockResolvedValue(null);

      await GET();

      expect(logger.warn).toHaveBeenCalledWith('GET /api/admin/orders - Unauthorized', {
        duration: expect.any(Number),
      });
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('موفق', () => {
    it('should return all orders with 200', async () => {
      const orders = [{ id: 'o1' }, { id: 'o2' }];
      getOrders.mockResolvedValue(orders as any);

      const res = await GET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(orders);
    });

    it('should return an empty array when there are no orders', async () => {
      const res = await GET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    });

    it('should call the query exactly once with no arguments', async () => {
      await GET();

      expect(getOrders).toHaveBeenCalledTimes(1);
      expect(getOrders).toHaveBeenCalledWith();
    });

    it('should return JSON', async () => {
      const res = await GET();

      expect(res.headers.get('content-type')).toContain('application/json');
    });

    it('should log success with the count', async () => {
      getOrders.mockResolvedValue([{ id: 'a' }, { id: 'b' }, { id: 'c' }] as any);

      await GET();

      expect(logger.info).toHaveBeenCalledWith('GET /api/admin/orders succeeded', {
        count: 3,
        duration: expect.any(Number),
      });
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe('خطا', () => {
    it('should return a generic 500 and NOT leak the error message', async () => {
      getOrders.mockRejectedValue(new Error('connection to db-prod-01 refused'));

      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: 'Server error' });
      expect(JSON.stringify(body)).not.toContain('db-prod-01');
    });

    it('should log the error message', async () => {
      getOrders.mockRejectedValue(new Error('DB down'));

      await GET();

      expect(logger.error).toHaveBeenCalledWith('GET /api/admin/orders failed', {
        error: 'DB down',
        duration: expect.any(Number),
      });
    });

    it('should log "Unknown" for a non-Error throw', async () => {
      getOrders.mockRejectedValue('boom');

      expect((await GET()).status).toBe(500);
      expect(logger.error).toHaveBeenCalledWith(
        'GET /api/admin/orders failed',
        expect.objectContaining({ error: 'Unknown' })
      );
    });

    it('should return 500 when the session lookup throws', async () => {
      getSession.mockRejectedValue(new Error('auth down'));

      const res = await GET();

      expect(res.status).toBe(500);
      expect(getOrders).not.toHaveBeenCalled();
    });

    it('should return 500 when headers() throws', async () => {
      vi.mocked(headers).mockRejectedValue(new Error('no request scope'));

      expect((await GET()).status).toBe(500);
    });
  });
});
