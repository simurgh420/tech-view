// @vitest-environment node
// tests/integration/app/api/orders/[id]/route.test.ts
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
  getOrderByIdDB: vi.fn(),
}));

vi.mock('@/features/orders/server/mutations', () => ({
  cancelOrderDB: vi.fn(),
}));

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getOrderByIdDB } from '@/features/orders/server/queries';
import { cancelOrderDB } from '@/features/orders/server/mutations';
import { GET, PATCH } from '@/app/api/orders/[id]/route';

const getSession = auth.api.getSession as unknown as ReturnType<typeof vi.fn>;
const getOrder = vi.mocked(getOrderByIdDB);
const cancelOrder = vi.mocked(cancelOrderDB);

const requestHeaders = new Headers({ cookie: 'session=abc' });
const ID = 'order-1';
const URL_ = `http://localhost/api/orders/${ID}`;

const ctx = (id = ID) => ({ params: Promise.resolve({ id }) });
const callGET = (id?: string) => GET(new Request(URL_), ctx(id));
const callPATCH = (id?: string, body?: unknown) =>
  PATCH(
    new Request(URL_, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    ctx(id)
  );

describe('/api/orders/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(requestHeaders as any);
    getSession.mockResolvedValue({ user: { id: 'user-1', role: 'USER' } });
    getOrder.mockResolvedValue({ id: ID } as any);
    cancelOrder.mockResolvedValue({ success: true, order: { id: ID, status: 'CANCELED' } } as any);
  });

  // ═════════════════════════════════════════════════════
  // احراز هویت برای هر دو method
  // ═════════════════════════════════════════════════════
  describe.each([
    ['GET', () => callGET()],
    ['PATCH', () => callPATCH()],
  ] as const)('%s › auth', (method, call) => {
    it('should read the session using the request headers', async () => {
      await call();

      expect(getSession).toHaveBeenCalledWith({ headers: requestHeaders });
    });

    it.each([[null], [{ user: null }]])('should return 401 for session %j', async session => {
      getSession.mockResolvedValue(session);

      const res = await call();

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should NOT touch the database when unauthenticated', async () => {
      getSession.mockResolvedValue(null);

      await call();

      expect(getOrder).not.toHaveBeenCalled();
      expect(cancelOrder).not.toHaveBeenCalled();
    });

    it('should log a warning when unauthenticated', async () => {
      getSession.mockResolvedValue(null);

      await call();

      expect(logger.warn).toHaveBeenCalledWith(`${method} /api/orders/[id] - Unauthorized`, {
        duration: expect.any(Number),
      });
    });

    it('should return a generic 500 when the session lookup throws', async () => {
      getSession.mockRejectedValue(new Error('auth down'));

      const res = await call();

      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: 'Server error' });
    });
  });

  // ═════════════════════════════════════════════════════
  // GET
  // ═════════════════════════════════════════════════════
  describe('GET', () => {
    it('should look up the order by route id AND the session user id', async () => {
      await callGET('order-42');

      expect(getOrder).toHaveBeenCalledWith('order-42', 'user-1');
    });

    it('should return the order wrapped in { order }', async () => {
      const order = { id: ID, total: 1000, items: [{ id: 'i1' }] };
      getOrder.mockResolvedValue(order as any);

      const res = await callGET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ order });
    });

    it('should log success with orderId and userId', async () => {
      await callGET();

      expect(logger.info).toHaveBeenCalledWith('GET /api/orders/[id] succeeded', {
        orderId: ID,
        userId: 'user-1',
        duration: expect.any(Number),
      });
    });

    it('should return 404 when the order does not exist or belongs to someone else', async () => {
      getOrder.mockResolvedValue(null);

      const res = await callGET();

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Order not found' });
    });

    it("should answer identically for a missing order and another user's order (no id enumeration)", async () => {
      getOrder.mockResolvedValue(null);

      const a = await callGET('exists-but-not-mine');
      const b = await callGET('does-not-exist');

      expect(a.status).toBe(b.status);
      expect(await a.json()).toEqual(await b.json());
    });

    it('should log a warning with orderId and userId when not found', async () => {
      getOrder.mockResolvedValue(null);

      await callGET();

      expect(logger.warn).toHaveBeenCalledWith('GET /api/orders/[id] - Not found', {
        orderId: ID,
        userId: 'user-1',
        duration: expect.any(Number),
      });
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should return a generic 500 and NOT leak the error message', async () => {
      getOrder.mockRejectedValue(new Error('connection to db-prod-01 refused'));

      const res = await callGET();
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: 'Server error' });
      expect(JSON.stringify(body)).not.toContain('db-prod-01');
    });

    it('should log the error and "Unknown" for non-Error throws', async () => {
      getOrder.mockRejectedValueOnce(new Error('DB down'));
      await callGET();
      expect(logger.error).toHaveBeenCalledWith('GET /api/orders/[id] failed', {
        error: 'DB down',
        duration: expect.any(Number),
      });

      getOrder.mockRejectedValueOnce('boom');
      await callGET();
      expect(logger.error).toHaveBeenLastCalledWith(
        'GET /api/orders/[id] failed',
        expect.objectContaining({ error: 'Unknown' })
      );
    });
  });

  // ═════════════════════════════════════════════════════
  // PATCH (لغو سفارش)
  // ═════════════════════════════════════════════════════
  describe('PATCH', () => {
    it('should cancel using the route id AND the session user id', async () => {
      await callPATCH('order-42');

      expect(cancelOrder).toHaveBeenCalledTimes(1);
      expect(cancelOrder).toHaveBeenCalledWith('order-42', 'user-1');
    });

    it('should return the canceled order wrapped in { order }', async () => {
      const order = { id: ID, status: 'CANCELED' };
      cancelOrder.mockResolvedValue({ success: true, order } as any);

      const res = await callPATCH();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ order });
    });

    it('should log success with orderId and userId', async () => {
      await callPATCH();

      expect(logger.info).toHaveBeenCalledWith('PATCH /api/orders/[id] succeeded', {
        orderId: ID,
        userId: 'user-1',
        duration: expect.any(Number),
      });
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should only ever cancel: the request body cannot change the status or the owner', async () => {
      await callPATCH(ID, { status: 'DELIVERED', userId: 'evil-user', total: 1 });

      expect(cancelOrder).toHaveBeenCalledTimes(1);
      expect(cancelOrder).toHaveBeenCalledWith(ID, 'user-1');
    });

    it('should work without a body', async () => {
      expect((await callPATCH(ID, undefined)).status).toBe(200);
    });

    it('should return 404 when the order is not found (or not owned by the user)', async () => {
      cancelOrder.mockResolvedValue({ success: false, reason: 'NOT_FOUND' } as any);

      const res = await callPATCH();

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'سفارش پیدا نشد' });
    });

    it('should return 400 when the order can no longer be canceled', async () => {
      cancelOrder.mockResolvedValue({ success: false, reason: 'NOT_CANCELABLE' } as any);

      const res = await callPATCH();

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'این سفارش دیگر قابل لغو نیست' });
    });

    it.each(['NOT_FOUND', 'NOT_CANCELABLE'])(
      'should log a warning with the reason %s',
      async reason => {
        cancelOrder.mockResolvedValue({ success: false, reason } as any);

        await callPATCH();

        expect(logger.warn).toHaveBeenCalledWith('PATCH /api/orders/[id] - Cannot cancel', {
          orderId: ID,
          userId: 'user-1',
          reason,
          duration: expect.any(Number),
        });
        expect(logger.info).not.toHaveBeenCalled();
      }
    );

    it('should return a generic 500 and NOT leak the error message', async () => {
      cancelOrder.mockRejectedValue(new Error('Record to update not found: orders'));

      const res = await callPATCH();
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: 'Server error' });
      expect(JSON.stringify(body)).not.toContain('Record');
    });

    it('should log the error and "Unknown" for non-Error throws', async () => {
      cancelOrder.mockRejectedValueOnce(new Error('DB down'));
      await callPATCH();
      expect(logger.error).toHaveBeenCalledWith('PATCH /api/orders/[id] failed', {
        error: 'DB down',
        duration: expect.any(Number),
      });

      cancelOrder.mockRejectedValueOnce('boom');
      await callPATCH();
      expect(logger.error).toHaveBeenLastCalledWith(
        'PATCH /api/orders/[id] failed',
        expect.objectContaining({ error: 'Unknown' })
      );
    });
  });
});
