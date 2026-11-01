// @vitest-environment node
// tests/integration/app/api/admin/orders/[id]/route.test.ts
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
  getAdminOrderByIdDB: vi.fn(),
  updateOrderStatusDB: vi.fn(),
}));

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getAdminOrderByIdDB, updateOrderStatusDB } from '@/features/orders/server/queries';
import { OrderStatus } from '@/app/generated/prisma/enums';
import { GET, PATCH } from '@/app/api/admin/orders/[id]/route';

const getSession = auth.api.getSession as unknown as ReturnType<typeof vi.fn>;
const getOrder = vi.mocked(getAdminOrderByIdDB);
const updateStatus = vi.mocked(updateOrderStatusDB);

const requestHeaders = new Headers({ cookie: 'session=abc' });
const ID = 'order-1';
const URL_ = `http://localhost/api/admin/orders/${ID}`;
const STATUSES = Object.values(OrderStatus) as string[];

// ─── ابزارهای کمکی ───────────────────────────────────────

const ctx = (id = ID) => ({ params: Promise.resolve({ id }) });

const callGET = (id?: string) => GET(new Request(URL_), ctx(id));

const callPATCH = (body?: unknown, id?: string) =>
  PATCH(
    new Request(URL_, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
    ctx(id)
  );

const callPATCHRaw = (raw: string) =>
  PATCH(new Request(URL_, { method: 'PATCH', body: raw }), ctx());

const validStatus = STATUSES[0];

describe('/api/admin/orders/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(requestHeaders as any);
    getSession.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
    getOrder.mockResolvedValue({ id: ID } as any);
    updateStatus.mockResolvedValue({ id: ID } as any);
  });

  // ═════════════════════════════════════════════════════
  // دسترسی برای هر دو method
  // ═════════════════════════════════════════════════════
  describe.each([
    ['GET', () => callGET()],
    ['PATCH', () => callPATCH({ status: validStatus })],
  ] as const)('%s › auth', (_method, call) => {
    it('should read the session using the request headers', async () => {
      await call();

      expect(getSession).toHaveBeenCalledWith({ headers: requestHeaders });
    });

    it('should return 401 without a session', async () => {
      getSession.mockResolvedValue(null);

      const res = await call();

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 when the session has no user', async () => {
      getSession.mockResolvedValue({ user: null });

      expect((await call()).status).toBe(401);
    });

    it.each(['USER', 'user', 'admin', '', null, undefined])(
      'should return 401 for role %j',
      async role => {
        getSession.mockResolvedValue({ user: { id: 'u1', role } });

        expect((await call()).status).toBe(401);
      }
    );

    it.each(['ADMIN', 'SUPER_ADMIN'])('should allow role %s', async role => {
      getSession.mockResolvedValue({ user: { id: 'u1', role } });

      expect((await call()).status).toBe(200);
    });

    it('should NOT touch the database when unauthorized', async () => {
      getSession.mockResolvedValue({ user: { id: 'u1', role: 'USER' } });

      await call();

      expect(getOrder).not.toHaveBeenCalled();
      expect(updateStatus).not.toHaveBeenCalled();
    });

    it('should return a generic 500 when the session lookup throws', async () => {
      getSession.mockRejectedValue(new Error('auth down'));

      const res = await call();

      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: 'Server error' });
      expect(getOrder).not.toHaveBeenCalled();
      expect(updateStatus).not.toHaveBeenCalled();
    });
  });

  // ═════════════════════════════════════════════════════
  // GET
  // ═════════════════════════════════════════════════════
  describe('GET', () => {
    it('should look up the order by the id from the route params', async () => {
      await callGET('order-42');

      expect(getOrder).toHaveBeenCalledWith('order-42');
    });

    it('should return the order with 200', async () => {
      const order = { id: ID, total: 1000, items: [{ id: 'i1' }] };
      getOrder.mockResolvedValue(order as any);

      const res = await callGET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(order);
    });

    it('should log success with the order id', async () => {
      await callGET();

      expect(logger.info).toHaveBeenCalledWith('GET /api/admin/orders/[id] succeeded', {
        orderId: ID,
        duration: expect.any(Number),
      });
    });

    it('should return 404 when the order does not exist', async () => {
      getOrder.mockResolvedValue(null);

      const res = await callGET();

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Order not found' });
    });

    it('should log a warning (not info) when not found', async () => {
      getOrder.mockResolvedValue(null);

      await callGET();

      expect(logger.warn).toHaveBeenCalledWith('GET /api/admin/orders/[id] - Not found', {
        orderId: ID,
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

    it('should log the error', async () => {
      getOrder.mockRejectedValue(new Error('DB down'));

      await callGET();

      expect(logger.error).toHaveBeenCalledWith('GET /api/admin/orders/[id] failed', {
        error: 'DB down',
        duration: expect.any(Number),
      });
    });

    it('should log "Unknown" for a non-Error throw', async () => {
      getOrder.mockRejectedValue('boom');

      await callGET();

      expect(logger.error).toHaveBeenCalledWith(
        'GET /api/admin/orders/[id] failed',
        expect.objectContaining({ error: 'Unknown' })
      );
    });
  });

  // ═════════════════════════════════════════════════════
  // PATCH
  // ═════════════════════════════════════════════════════
  describe('PATCH', () => {
    describe('اعتبارسنجی بدنه', () => {
      it('should expose at least one status in the OrderStatus enum', () => {
        expect(STATUSES.length).toBeGreaterThan(0);
      });
      const invalidBodies: Array<[body: unknown, label: string]> = [
        [{}, 'empty object'],
        [{ status: undefined }, 'missing status'],
        [{ status: null }, 'null'],
        [{ status: '' }, 'empty string'],
        [{ status: 'NOT_A_STATUS' }, 'unknown value'],
        [{ status: 1 }, 'number'],
        [{ status: ['PENDING'] }, 'array'],
        [{ status: { value: 'PENDING' } }, 'object'],
        [null, 'null body'],
        ['PENDING', 'string body'],
        [[], 'array body'],
      ];

      it.each(invalidBodies)('should return 400 for %j (%s)', async body => {
        const res = await callPATCH(body);

        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: 'وضعیت نامعتبر است' });
        expect(updateStatus).not.toHaveBeenCalled();
      });
      it('should be case-sensitive (lowercase status is rejected)', async () => {
        const res = await callPATCH({ status: validStatus.toLowerCase() });

        expect(res.status).toBe(400);
      });

      it.each(STATUSES)('should accept the status %s', async status => {
        const res = await callPATCH({ status });

        expect(res.status).toBe(200);
        expect(updateStatus).toHaveBeenCalledWith(ID, status);
      });

      it('should ignore extra fields in the body', async () => {
        await callPATCH({ status: validStatus, total: 1, userId: 'evil', id: 'other' });

        expect(updateStatus).toHaveBeenCalledTimes(1);
        expect(updateStatus).toHaveBeenCalledWith(ID, validStatus);
      });

      it('should use the id from the route params, not from the body', async () => {
        await callPATCH({ status: validStatus, id: 'order-evil' }, 'order-42');

        expect(updateStatus).toHaveBeenCalledWith('order-42', validStatus);
      });
    });

    describe('موفق', () => {
      it('should return the updated order with 200', async () => {
        const updated = { id: ID, status: validStatus };
        updateStatus.mockResolvedValue(updated as any);

        const res = await callPATCH({ status: validStatus });

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual(updated);
      });

      it('should call updateOrderStatusDB exactly once', async () => {
        await callPATCH({ status: validStatus });

        expect(updateStatus).toHaveBeenCalledTimes(1);
      });

      it('should log success with order id and the new status', async () => {
        await callPATCH({ status: validStatus });

        expect(logger.info).toHaveBeenCalledWith('PATCH /api/admin/orders/[id] succeeded', {
          orderId: ID,
          status: validStatus,
          duration: expect.any(Number),
        });
      });
    });

    describe('خطا', () => {
      it('should return a generic 500 and NOT leak the error message', async () => {
        updateStatus.mockRejectedValue(new Error('Unique constraint failed on (status)'));

        const res = await callPATCH({ status: validStatus });
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body).toEqual({ error: 'Server error' });
        expect(JSON.stringify(body)).not.toContain('constraint');
      });

      it('should return 500 (not 404) when the order does not exist (see notes)', async () => {
        updateStatus.mockRejectedValue(
          Object.assign(new Error('Record to update not found.'), { code: 'P2025' })
        );

        const res = await callPATCH({ status: validStatus }, 'ghost');

        expect(res.status).toBe(500);
      });

      it('should log the error', async () => {
        updateStatus.mockRejectedValue(new Error('DB down'));

        await callPATCH({ status: validStatus });

        expect(logger.error).toHaveBeenCalledWith('PATCH /api/admin/orders/[id] failed', {
          error: 'DB down',
          duration: expect.any(Number),
        });
        expect(logger.info).not.toHaveBeenCalled();
      });

      it('should log "Unknown" for a non-Error throw', async () => {
        updateStatus.mockRejectedValue('boom');

        await callPATCH({ status: validStatus });

        expect(logger.error).toHaveBeenCalledWith(
          'PATCH /api/admin/orders/[id] failed',
          expect.objectContaining({ error: 'Unknown' })
        );
      });

      it('should return 500 for an invalid JSON body (see notes: should be 400)', async () => {
        const res = await callPATCHRaw('{not json');

        expect(res.status).toBe(500);
        expect(updateStatus).not.toHaveBeenCalled();
      });

      it('should return 500 for an empty body (see notes: should be 400)', async () => {
        const res = await callPATCHRaw('');

        expect(res.status).toBe(500);
        expect(updateStatus).not.toHaveBeenCalled();
      });
    });
  });
});
