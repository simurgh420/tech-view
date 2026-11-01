// @vitest-environment node
// tests/integration/app/api/admin/categories/[slug]/attributes/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

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

vi.mock('@/features/prisma-adapter/client', () => ({
  default: {
    category: { findUnique: vi.fn() },
    categoryAttribute: { findFirst: vi.fn() },
  },
}));

vi.mock('@/features/category/server/queries', () => ({
  getCategoryAttributesAdmin: vi.fn(),
}));

vi.mock('@/features/category/server/mutations', () => ({
  addCategoryAttributeAdmin: vi.fn(),
  updateCategoryAttributeAdmin: vi.fn(),
  deleteCategoryAttributeAdmin: vi.fn(),
  reorderCategoryAttributesAdmin: vi.fn(),
}));

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import prisma from '@/features/prisma-adapter/client';
import { getCategoryAttributesAdmin } from '@/features/category/server/queries';
import {
  addCategoryAttributeAdmin,
  updateCategoryAttributeAdmin,
  deleteCategoryAttributeAdmin,
  reorderCategoryAttributesAdmin,
} from '@/features/category/server/mutations';
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/categories/[slug]/attributes/route';

const getSession = auth.api.getSession as unknown as ReturnType<typeof vi.fn>;
const userHasPermission = auth.api.userHasPermission as unknown as ReturnType<typeof vi.fn>;
const categoryFindUnique = prisma.category.findUnique as unknown as ReturnType<typeof vi.fn>;
const attrFindFirst = prisma.categoryAttribute.findFirst as unknown as ReturnType<typeof vi.fn>;

const getAttrs = vi.mocked(getCategoryAttributesAdmin);
const addAttr = vi.mocked(addCategoryAttributeAdmin);
const updateAttr = vi.mocked(updateCategoryAttributeAdmin);
const deleteAttr = vi.mocked(deleteCategoryAttributeAdmin);
const reorderAttrs = vi.mocked(reorderCategoryAttributesAdmin);

const requestHeaders = new Headers({ cookie: 'session=abc' });
const adminUser = { id: 'admin-1', role: 'ADMIN' };
const SLUG = 'phones';
const BASE = `http://localhost/api/admin/categories/${SLUG}/attributes`;

// ─── ابزارهای کمکی ───────────────────────────────────────

const ctx = (slug = SLUG) => ({ params: Promise.resolve({ slug }) });

function makeReq(method: string, opts: { body?: unknown; rawBody?: string; query?: string } = {}) {
  const url = opts.query ? `${BASE}?${opts.query}` : BASE;
  const hasBody = opts.body !== undefined || opts.rawBody !== undefined;
  return new NextRequest(url, {
    method,
    ...(hasBody
      ? {
          body: opts.rawBody ?? JSON.stringify(opts.body),
          headers: { 'content-type': 'application/json' },
        }
      : {}),
  });
}

const callGET = (slug?: string) => GET(makeReq('GET'), ctx(slug));
const callPOST = (body?: unknown) => POST(makeReq('POST', { body }), ctx());
const callPATCH = (body?: unknown) => PATCH(makeReq('PATCH', { body }), ctx());
const callDELETE = (query = 'id=ca-1') => DELETE(makeReq('DELETE', { query }), ctx());

function allowAccess() {
  getSession.mockResolvedValue({ user: adminUser });
  userHasPermission.mockResolvedValue({ success: true, error: null });
}

describe('/api/admin/categories/[slug]/attributes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(requestHeaders as any);
    allowAccess();
    categoryFindUnique.mockResolvedValue({ id: 'cat-1' });
    attrFindFirst.mockResolvedValue({ id: 'ca-1' });
    getAttrs.mockResolvedValue([] as any);
    addAttr.mockResolvedValue({ id: 'ca-new' } as any);
    updateAttr.mockResolvedValue({ id: 'ca-1' } as any);
    deleteAttr.mockResolvedValue(undefined as any);
    reorderAttrs.mockResolvedValue(undefined as any);
  });

  // ═════════════════════════════════════════════════════
  // احراز هویت و مجوز برای هر چهار method
  // ═════════════════════════════════════════════════════
  describe.each([
    ['GET', () => callGET(), 'read'],
    ['POST', () => callPOST({ attributeId: 'a1' }), 'update'],
    ['PATCH', () => callPATCH({ id: 'ca-1', isRequired: true }), 'update'],
    ['DELETE', () => callDELETE(), 'delete'],
  ] as const)('%s › auth', (_method, call, permission) => {
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

    it('should return 403 without permission', async () => {
      userHasPermission.mockResolvedValue({ success: false, error: null });

      const res = await call();

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: 'Forbidden' });
    });

    it('should return 403 when the permission check returns an error', async () => {
      userHasPermission.mockResolvedValue({ success: true, error: 'x' });

      expect((await call()).status).toBe(403);
    });

    it(`should check the "categories:${permission}" permission for the session user`, async () => {
      await call();

      expect(userHasPermission).toHaveBeenCalledWith({
        headers: requestHeaders,
        body: { userId: 'admin-1', permissions: { categories: [permission] } },
      });
    });

    it('should NOT touch the database or mutations when unauthenticated', async () => {
      getSession.mockResolvedValue(null);

      await call();

      expect(userHasPermission).not.toHaveBeenCalled();
      expect(categoryFindUnique).not.toHaveBeenCalled();
      expect(getAttrs).not.toHaveBeenCalled();
      expect(addAttr).not.toHaveBeenCalled();
      expect(updateAttr).not.toHaveBeenCalled();
      expect(deleteAttr).not.toHaveBeenCalled();
      expect(reorderAttrs).not.toHaveBeenCalled();
    });

    it('should NOT touch the database or mutations when forbidden', async () => {
      userHasPermission.mockResolvedValue({ success: false, error: null });

      await call();

      expect(categoryFindUnique).not.toHaveBeenCalled();
      expect(getAttrs).not.toHaveBeenCalled();
      expect(addAttr).not.toHaveBeenCalled();
      expect(updateAttr).not.toHaveBeenCalled();
      expect(deleteAttr).not.toHaveBeenCalled();
      expect(reorderAttrs).not.toHaveBeenCalled();
    });

    it('should return 500 when the session lookup throws', async () => {
      getSession.mockRejectedValue(new Error('auth down'));

      expect((await call()).status).toBe(500);
    });
  });

  // ═════════════════════════════════════════════════════
  // GET
  // ═════════════════════════════════════════════════════
  describe('GET', () => {
    it('should log a warning for 401 and 403', async () => {
      getSession.mockResolvedValue(null);
      await callGET();
      expect(logger.warn).toHaveBeenCalledWith(
        `GET /api/admin/categories/${SLUG}/attributes - Unauthorized`,
        { duration: expect.any(Number) }
      );

      userHasPermission.mockResolvedValue({ success: false, error: null });
      getSession.mockResolvedValue({ user: adminUser });
      await callGET();
      expect(logger.warn).toHaveBeenCalledWith(
        `GET /api/admin/categories/${SLUG}/attributes - Forbidden`,
        { duration: expect.any(Number) }
      );
    });

    it('should return the attributes of the category', async () => {
      const attrs = [{ id: 'ca-1' }, { id: 'ca-2' }];
      getAttrs.mockResolvedValue(attrs as any);

      const res = await callGET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(attrs);
      expect(getAttrs).toHaveBeenCalledWith(SLUG);
    });

    it('should use the slug from the route params', async () => {
      await callGET('laptops');

      expect(getAttrs).toHaveBeenCalledWith('laptops');
    });

    it('should return 200 with an empty array when the category has no attributes', async () => {
      getAttrs.mockResolvedValue([] as any);

      const res = await callGET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    });

    it('should return 404 when the category does not exist', async () => {
      getAttrs.mockResolvedValue(null as any);

      const res = await callGET();

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'دسته‌بندی پیدا نشد' });
    });

    it('should log success with userId and count', async () => {
      getAttrs.mockResolvedValue([{ id: 'a' }, { id: 'b' }] as any);

      await callGET();

      expect(logger.info).toHaveBeenCalledWith(
        `GET /api/admin/categories/${SLUG}/attributes - Success`,
        { userId: 'admin-1', count: 2, duration: expect.any(Number) }
      );
    });

    it('should return a generic 500 and NOT leak the error message', async () => {
      getAttrs.mockRejectedValue(new Error('connection to db-prod-01 refused'));

      const res = await callGET();
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: 'Internal server error' });
      expect(JSON.stringify(body)).not.toContain('db-prod-01');
      expect(logger.error).toHaveBeenCalledWith(
        `GET /api/admin/categories/${SLUG}/attributes failed`,
        { error: 'connection to db-prod-01 refused', duration: expect.any(Number) }
      );
    });

    it('should log "Unknown" for a non-Error throw', async () => {
      getAttrs.mockRejectedValue('boom');

      expect((await callGET()).status).toBe(500);
      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ error: 'Unknown' })
      );
    });
  });

  // ═════════════════════════════════════════════════════
  // POST
  // ═════════════════════════════════════════════════════
  describe('POST', () => {
    it('should look up the category by slug (id only)', async () => {
      await callPOST({ attributeId: 'a1' });

      expect(categoryFindUnique).toHaveBeenCalledWith({
        where: { slug: SLUG },
        select: { id: true },
      });
    });

    it('should return 404 when the category does not exist', async () => {
      categoryFindUnique.mockResolvedValue(null);

      const res = await callPOST({ attributeId: 'a1' });

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'دسته‌بندی پیدا نشد' });
      expect(addAttr).not.toHaveBeenCalled();
    });

    it('should check the category BEFORE validating the body (404 wins over 400)', async () => {
      categoryFindUnique.mockResolvedValue(null);

      expect((await callPOST({})).status).toBe(404);
    });

    it.each([{}, { attributeId: '' }, { attributeId: null }, { attributeId: 0 }])(
      'should return 400 when attributeId is missing or falsy (%j)',
      async body => {
        const res = await callPOST(body);

        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: 'attributeId الزامی است' });
        expect(addAttr).not.toHaveBeenCalled();
      }
    );

    it('should create the link with defaults (isRequired/isFilterable = false)', async () => {
      const res = await callPOST({ attributeId: 'a1' });

      expect(res.status).toBe(201);
      expect(addAttr).toHaveBeenCalledWith({
        categoryId: 'cat-1',
        attributeId: 'a1',
        isRequired: false,
        isFilterable: false,
      });
    });

    it('should pass isRequired and isFilterable through', async () => {
      await callPOST({ attributeId: 'a1', isRequired: true, isFilterable: true });

      expect(addAttr).toHaveBeenCalledWith({
        categoryId: 'cat-1',
        attributeId: 'a1',
        isRequired: true,
        isFilterable: true,
      });
    });

    it('should use the categoryId from the database, not from the body', async () => {
      await callPOST({ attributeId: 'a1', categoryId: 'evil-cat' });

      expect(addAttr.mock.calls[0][0].categoryId).toBe('cat-1');
    });

    it('should return the created record with 201', async () => {
      addAttr.mockResolvedValue({ id: 'ca-new', attributeId: 'a1' } as any);

      const res = await callPOST({ attributeId: 'a1' });

      expect(res.status).toBe(201);
      expect(await res.json()).toEqual({ id: 'ca-new', attributeId: 'a1' });
    });

    it('should log creation with userId and attributeId', async () => {
      await callPOST({ attributeId: 'a1' });

      expect(logger.info).toHaveBeenCalledWith(
        `POST /api/admin/categories/${SLUG}/attributes - Created`,
        { userId: 'admin-1', attributeId: 'a1', duration: expect.any(Number) }
      );
    });

    it('should return 409 when the attribute is already assigned', async () => {
      addAttr.mockRejectedValue(new Error('ATTRIBUTE_ALREADY_ASSIGNED'));

      const res = await callPOST({ attributeId: 'a1' });

      expect(res.status).toBe(409);
      expect(await res.json()).toEqual({ error: 'این مشخصه قبلاً به دسته‌بندی اضافه شده است' });
    });

    it('should NOT log a 409 as an error', async () => {
      addAttr.mockRejectedValue(new Error('ATTRIBUTE_ALREADY_ASSIGNED'));

      await callPOST({ attributeId: 'a1' });

      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should return a generic 500 for unexpected errors', async () => {
      addAttr.mockRejectedValue(new Error('DB down'));

      const res = await callPOST({ attributeId: 'a1' });

      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: 'Internal server error' });
      expect(logger.error).toHaveBeenCalledWith(
        `POST /api/admin/categories/${SLUG}/attributes failed`,
        { error: 'DB down', duration: expect.any(Number) }
      );
    });

    it('should return 500 for an invalid JSON body (see notes: should be 400)', async () => {
      const res = await POST(makeReq('POST', { rawBody: '{not json' }), ctx());

      expect(res.status).toBe(500);
      expect(addAttr).not.toHaveBeenCalled();
    });
  });

  // ═════════════════════════════════════════════════════
  // PATCH
  // ═════════════════════════════════════════════════════
  describe('PATCH', () => {
    it('should return 404 when the category does not exist', async () => {
      categoryFindUnique.mockResolvedValue(null);

      const res = await callPATCH({ id: 'ca-1' });

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'دسته‌بندی پیدا نشد' });
    });

    describe('reorder', () => {
      it('should return 400 when items is not an array', async () => {
        for (const items of [undefined, null, 'x', { 0: 'a' }, 5]) {
          const res = await callPATCH({ action: 'reorder', items });

          expect(res.status).toBe(400);
          expect(await res.json()).toEqual({ error: 'items must be an array' });
        }
        expect(reorderAttrs).not.toHaveBeenCalled();
      });

      it('should reorder using the category id from the database', async () => {
        const items = [
          { id: 'ca-2', order: 0 },
          { id: 'ca-1', order: 1 },
        ];

        const res = await callPATCH({ action: 'reorder', items });

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ success: true });
        expect(reorderAttrs).toHaveBeenCalledWith('cat-1', items);
      });

      it('should accept an empty items array', async () => {
        const res = await callPATCH({ action: 'reorder', items: [] });

        expect(res.status).toBe(200);
        expect(reorderAttrs).toHaveBeenCalledWith('cat-1', []);
      });

      it('should NOT run the single-update flow', async () => {
        await callPATCH({ action: 'reorder', items: [], id: 'ca-1' });

        expect(attrFindFirst).not.toHaveBeenCalled();
        expect(updateAttr).not.toHaveBeenCalled();
      });

      it('should log the reorder with item count', async () => {
        await callPATCH({ action: 'reorder', items: [{ id: 'a', order: 0 }] });

        expect(logger.info).toHaveBeenCalledWith(
          `PATCH /api/admin/categories/${SLUG}/attributes - Reordered`,
          { userId: 'admin-1', count: 1, duration: expect.any(Number) }
        );
      });
    });

    describe('به‌روزرسانی یک مشخصه', () => {
      it('should return 400 when id is missing', async () => {
        const res = await callPATCH({ isRequired: true });

        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: 'id الزامی است' });
        expect(updateAttr).not.toHaveBeenCalled();
      });

      it('should verify the attribute belongs to THIS category', async () => {
        await callPATCH({ id: 'ca-1', isRequired: true });

        expect(attrFindFirst).toHaveBeenCalledWith({
          where: { id: 'ca-1', categoryId: 'cat-1' },
          select: { id: true },
        });
      });

      it('should return 404 and NOT update an attribute of another category', async () => {
        attrFindFirst.mockResolvedValue(null);

        const res = await callPATCH({ id: 'ca-other', isRequired: true });

        expect(res.status).toBe(404);
        expect(await res.json()).toEqual({ error: 'مشخصه پیدا نشد' });
        expect(updateAttr).not.toHaveBeenCalled();
      });

      it('should update only the fields that were sent', async () => {
        await callPATCH({ id: 'ca-1', isRequired: true });

        expect(updateAttr).toHaveBeenCalledWith('ca-1', { isRequired: true });
      });

      it('should update all three fields together', async () => {
        await callPATCH({ id: 'ca-1', isRequired: true, isFilterable: false, order: 3 });

        expect(updateAttr).toHaveBeenCalledWith('ca-1', {
          isRequired: true,
          isFilterable: false,
          order: 3,
        });
      });

      it('should accept false and 0 as real values (not skip them)', async () => {
        await callPATCH({ id: 'ca-1', isRequired: false, isFilterable: false, order: 0 });

        expect(updateAttr).toHaveBeenCalledWith('ca-1', {
          isRequired: false,
          isFilterable: false,
          order: 0,
        });
      });

      it('should convert order to a number', async () => {
        await callPATCH({ id: 'ca-1', order: '5' });

        expect(updateAttr).toHaveBeenCalledWith('ca-1', { order: 5 });
      });

      it('should coerce flags with Boolean() (the string "false" becomes true, see notes)', async () => {
        await callPATCH({ id: 'ca-1', isRequired: 'false' });

        expect(updateAttr).toHaveBeenCalledWith('ca-1', { isRequired: true });
      });

      it('should pass NaN as order for a non-numeric value (see notes)', async () => {
        await callPATCH({ id: 'ca-1', order: 'abc' });

        expect(updateAttr.mock.calls[0][1].order).toBeNaN();
      });

      it('should ignore unknown fields (no mass assignment)', async () => {
        await callPATCH({ id: 'ca-1', isRequired: true, categoryId: 'evil', attributeId: 'evil' });

        expect(updateAttr).toHaveBeenCalledWith('ca-1', { isRequired: true });
      });

      it('should call update with an empty object when only id is sent', async () => {
        await callPATCH({ id: 'ca-1' });

        expect(updateAttr).toHaveBeenCalledWith('ca-1', {});
      });

      it('should return the updated record', async () => {
        updateAttr.mockResolvedValue({ id: 'ca-1', isRequired: true } as any);

        const res = await callPATCH({ id: 'ca-1', isRequired: true });

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ id: 'ca-1', isRequired: true });
      });

      it('should log the update', async () => {
        await callPATCH({ id: 'ca-1', isRequired: true });

        expect(logger.info).toHaveBeenCalledWith(
          `PATCH /api/admin/categories/${SLUG}/attributes - Updated`,
          { userId: 'admin-1', attributeId: 'ca-1', duration: expect.any(Number) }
        );
      });
    });

    describe('خطا', () => {
      it('should return the raw error message with 500 (leak, see notes)', async () => {
        updateAttr.mockRejectedValue(new Error('Unique constraint failed on the fields: (order)'));

        const res = await callPATCH({ id: 'ca-1', order: 1 });

        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({
          error: 'Unique constraint failed on the fields: (order)',
        });
      });

      it('should return a generic message for non-Error throws', async () => {
        updateAttr.mockRejectedValue('boom');

        const res = await callPATCH({ id: 'ca-1' });

        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: 'Internal server error' });
      });

      it('should log the error with its stack', async () => {
        const error = new Error('DB down');
        updateAttr.mockRejectedValue(error);

        await callPATCH({ id: 'ca-1' });

        expect(logger.error).toHaveBeenCalledWith(
          `PATCH /api/admin/categories/${SLUG}/attributes failed`,
          { error: 'DB down', stack: error.stack, duration: expect.any(Number) }
        );
      });

      it('should return 500 when reorder fails', async () => {
        reorderAttrs.mockRejectedValue(new Error('reorder failed'));

        const res = await callPATCH({ action: 'reorder', items: [] });

        expect(res.status).toBe(500);
      });

      it('should return 500 for an invalid JSON body (see notes: should be 400)', async () => {
        const res = await PATCH(makeReq('PATCH', { rawBody: '{bad' }), ctx());

        expect(res.status).toBe(500);
      });
    });
  });

  // ═════════════════════════════════════════════════════
  // DELETE
  // ═════════════════════════════════════════════════════
  describe('DELETE', () => {
    it('should return 404 when the category does not exist', async () => {
      categoryFindUnique.mockResolvedValue(null);

      const res = await callDELETE();

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'دسته‌بندی پیدا نشد' });
      expect(deleteAttr).not.toHaveBeenCalled();
    });

    it('should return 400 when the id query param is missing', async () => {
      const res = await callDELETE('');

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'id الزامی است' });
      expect(deleteAttr).not.toHaveBeenCalled();
    });

    it('should return 400 when the id query param is empty', async () => {
      expect((await callDELETE('id=')).status).toBe(400);
    });

    it('should verify the attribute belongs to THIS category', async () => {
      await callDELETE('id=ca-7');

      expect(attrFindFirst).toHaveBeenCalledWith({
        where: { id: 'ca-7', categoryId: 'cat-1' },
        select: { id: true },
      });
    });

    it('should return 404 and NOT delete an attribute of another category', async () => {
      attrFindFirst.mockResolvedValue(null);

      const res = await callDELETE('id=ca-other');

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'مشخصه پیدا نشد' });
      expect(deleteAttr).not.toHaveBeenCalled();
    });

    it('should delete the attribute and return success', async () => {
      const res = await callDELETE('id=ca-7');

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
      expect(deleteAttr).toHaveBeenCalledTimes(1);
      expect(deleteAttr).toHaveBeenCalledWith('ca-7');
    });

    it('should log the deletion', async () => {
      await callDELETE('id=ca-7');

      expect(logger.info).toHaveBeenCalledWith(
        `DELETE /api/admin/categories/${SLUG}/attributes - Deleted`,
        { userId: 'admin-1', attributeId: 'ca-7', duration: expect.any(Number) }
      );
    });

    it('should return a generic 500 and log the error', async () => {
      deleteAttr.mockRejectedValue(new Error('FK violation: products use this attribute'));

      const res = await callDELETE();

      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: 'Internal server error' });
      expect(logger.error).toHaveBeenCalledWith(
        `DELETE /api/admin/categories/${SLUG}/attributes failed`,
        { error: 'FK violation: products use this attribute', duration: expect.any(Number) }
      );
    });
  });
});
