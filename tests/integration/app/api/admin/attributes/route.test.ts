// @vitest-environment node
// tests/integration/app/api/admin/attributes/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      userHasPermission: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('@/features/products/server/attributes/queries', () => ({
  getAllAttributesAdmin: vi.fn(),
}));

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getAllAttributesAdmin } from '@/features/products/server/attributes/queries';
import { GET } from '@/app/api/admin/attributes/route';

const getSession = auth.api.getSession as unknown as ReturnType<typeof vi.fn>;
const userHasPermission = auth.api.userHasPermission as unknown as ReturnType<typeof vi.fn>;
const getAll = vi.mocked(getAllAttributesAdmin);

const requestHeaders = new Headers({ cookie: 'session=abc' });
const adminUser = { id: 'admin-1', role: 'ADMIN' };

/** حالت پیش‌فرض: لاگین‌شده و دارای مجوز */
function allowAccess() {
  getSession.mockResolvedValue({ user: adminUser });
  userHasPermission.mockResolvedValue({ success: true, error: null });
}

describe('GET /api/admin/attributes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(requestHeaders as any);
    allowAccess();
    getAll.mockResolvedValue([]);
  });

  describe('احراز هویت (401)', () => {
    it('should return 401 when there is no session', async () => {
      getSession.mockResolvedValue(null);

      const res = await GET();

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 when the session has no user', async () => {
      getSession.mockResolvedValue({ user: null });

      const res = await GET();

      expect(res.status).toBe(401);
    });

    it('should NOT check permissions or hit the database without a session', async () => {
      getSession.mockResolvedValue(null);

      await GET();

      expect(userHasPermission).not.toHaveBeenCalled();
      expect(getAll).not.toHaveBeenCalled();
    });

    it('should log a warning with "Unauthorized"', async () => {
      getSession.mockResolvedValue(null);

      await GET();

      expect(logger.warn).toHaveBeenCalledWith('GET /api/admin/attributes - Unauthorized', {
        duration: expect.any(Number),
      });
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('مجوز (403)', () => {
    it('should return 403 when the permission check returns an error', async () => {
      userHasPermission.mockResolvedValue({ success: false, error: 'FORBIDDEN' });

      const res = await GET();

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: 'Forbidden' });
    });

    it('should return 403 when success is false (without error)', async () => {
      userHasPermission.mockResolvedValue({ success: false, error: null });

      expect((await GET()).status).toBe(403);
    });

    it('should return 403 when an error is present even if success is true', async () => {
      userHasPermission.mockResolvedValue({ success: true, error: 'weird' });

      expect((await GET()).status).toBe(403);
    });

    it('should return 403 when the permission result is empty', async () => {
      userHasPermission.mockResolvedValue({});

      expect((await GET()).status).toBe(403);
    });

    it('should NOT hit the database when forbidden', async () => {
      userHasPermission.mockResolvedValue({ success: false, error: null });

      await GET();

      expect(getAll).not.toHaveBeenCalled();
    });

    it('should log a warning with "Forbidden"', async () => {
      userHasPermission.mockResolvedValue({ success: false, error: null });

      await GET();

      expect(logger.warn).toHaveBeenCalledWith('GET /api/admin/attributes - Forbidden', {
        duration: expect.any(Number),
      });
    });
  });

  describe('بررسی مجوز', () => {
    it('should read the session using the request headers', async () => {
      await GET();

      expect(getSession).toHaveBeenCalledWith({ headers: requestHeaders });
    });

    it('should check the "categories:read" permission for the session user', async () => {
      await GET();

      expect(userHasPermission).toHaveBeenCalledWith({
        headers: requestHeaders,
        body: {
          userId: 'admin-1',
          permissions: { categories: ['read'] },
        },
      });
    });

    it('should NOT request the "update" permission for a read-only endpoint', async () => {
      await GET();

      const body = userHasPermission.mock.calls[0][0].body;
      expect(body.permissions.categories).not.toContain('update');
    });

    it('should take userId from the server session, not from the request', async () => {
      getSession.mockResolvedValue({ user: { id: 'someone-else' } });

      await GET();

      expect(userHasPermission.mock.calls[0][0].body.userId).toBe('someone-else');
    });

    it('should check the session before the permission', async () => {
      const order: string[] = [];
      getSession.mockImplementation(async () => {
        order.push('session');
        return { user: adminUser };
      });
      userHasPermission.mockImplementation(async () => {
        order.push('permission');
        return { success: true, error: null };
      });

      await GET();

      expect(order).toEqual(['session', 'permission']);
    });
  });

  describe('موفق (200)', () => {
    it('should return 200 with the attributes list', async () => {
      const attributes = [
        { id: 'a1', label: 'رم', options: [{ id: 'o1', value: '8GB', order: 0 }] },
        { id: 'a2', label: 'رنگ', options: [] },
      ];
      getAll.mockResolvedValue(attributes as any);

      const res = await GET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(attributes);
    });

    it('should return an empty array when there are no attributes', async () => {
      getAll.mockResolvedValue([]);

      const res = await GET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    });

    it('should call the query exactly once', async () => {
      await GET();

      expect(getAll).toHaveBeenCalledTimes(1);
      expect(getAll).toHaveBeenCalledWith();
    });

    it('should return JSON', async () => {
      const res = await GET();

      expect(res.headers.get('content-type')).toContain('application/json');
    });

    it('should log success with userId and count', async () => {
      getAll.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }] as any);

      await GET();

      expect(logger.info).toHaveBeenCalledWith('GET /api/admin/attributes - Success', {
        userId: 'admin-1',
        count: 3,
        duration: expect.any(Number),
      });
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('خطای داخلی (500)', () => {
    it('should return 500 when the query fails', async () => {
      getAll.mockRejectedValue(new Error('DB down'));

      const res = await GET();

      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: 'Internal server error' });
    });

    it('should NOT leak the internal error message to the client', async () => {
      getAll.mockRejectedValue(new Error('connection to db-prod-01:5432 refused'));

      const res = await GET();

      expect(JSON.stringify(await res.json())).not.toContain('db-prod-01');
    });

    it('should log the error message', async () => {
      getAll.mockRejectedValue(new Error('DB down'));

      await GET();

      expect(logger.error).toHaveBeenCalledWith('GET /api/admin/attributes failed', {
        error: 'DB down',
        duration: expect.any(Number),
      });
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should log "Unknown" when a non-Error is thrown', async () => {
      getAll.mockRejectedValue('boom');

      const res = await GET();

      expect(res.status).toBe(500);
      expect(logger.error).toHaveBeenCalledWith(
        'GET /api/admin/attributes failed',
        expect.objectContaining({ error: 'Unknown' })
      );
    });

    it('should return 500 when reading the session throws', async () => {
      getSession.mockRejectedValue(new Error('auth down'));

      const res = await GET();

      expect(res.status).toBe(500);
      expect(getAll).not.toHaveBeenCalled();
    });

    it('should return 500 when the permission check throws', async () => {
      userHasPermission.mockRejectedValue(new Error('permission service down'));

      const res = await GET();

      expect(res.status).toBe(500);
      expect(getAll).not.toHaveBeenCalled();
    });

    it('should return 500 when headers() throws', async () => {
      vi.mocked(headers).mockRejectedValue(new Error('no request scope'));

      const res = await GET();

      expect(res.status).toBe(500);
    });
  });
});
