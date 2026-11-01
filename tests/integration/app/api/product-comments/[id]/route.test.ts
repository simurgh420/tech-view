// @vitest-environment node
// tests/integration/app/api/product-comments/[id]/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn(), userHasPermission: vi.fn() } },
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('@/features/product-comments/server/mutations', () => ({
  updateComment: vi.fn(),
  deleteComment: vi.fn(),
}));

vi.mock('@/features/product-comments/server/queries', () => ({
  getCommentById: vi.fn(),
}));

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { updateComment, deleteComment } from '@/features/product-comments/server/mutations';
import { getCommentById } from '@/features/product-comments/server/queries';
import { PATCH, DELETE } from '@/app/api/product-comments/[id]/route';

const getSession = auth.api.getSession as unknown as ReturnType<typeof vi.fn>;
const userHasPermission = auth.api.userHasPermission as unknown as ReturnType<typeof vi.fn>;
const update = vi.mocked(updateComment);
const remove = vi.mocked(deleteComment);
const getComment = vi.mocked(getCommentById);

const requestHeaders = new Headers({ cookie: 'session=abc' });
const ID = 'c1';
const URL_ = `http://localhost/api/product-comments/${ID}`;

const ownComment = { id: ID, authorId: 'user-1', productId: 'p1' };
const othersComment = { id: ID, authorId: 'someone-else', productId: 'p1' };

// ─── ابزارهای کمکی ───────────────────────────────────────

const ctx = (id = ID) => ({ params: Promise.resolve({ id }) });

const callPATCH = (body?: unknown, id?: string) =>
  PATCH(
    new NextRequest(URL_, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
    ctx(id)
  );

const callDELETE = (id?: string) => DELETE(new NextRequest(URL_, { method: 'DELETE' }), ctx(id));

/** فقط permissionهای داده‌شده را می‌پذیرد (بر اساس اولین action درخواستی) */
function grant(...allowed: string[]) {
  userHasPermission.mockImplementation(async ({ body }: any) => {
    const asked = body.permissions.productComments[0];
    return { success: allowed.includes(asked), error: null };
  });
}

const askedPermissions = () =>
  userHasPermission.mock.calls.map(([arg]) => arg.body.permissions.productComments[0]);

describe('/api/product-comments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(requestHeaders as any);
    getSession.mockResolvedValue({ user: { id: 'user-1', role: 'USER' } });
    getComment.mockResolvedValue(ownComment as any);
    grant('update', 'update:own', 'delete', 'delete:own', 'moderate');
    update.mockResolvedValue({ id: ID } as any);
    remove.mockResolvedValue({ success: true, softDeleted: false } as any);
  });

  // ═════════════════════════════════════════════════════
  // رفتار مشترک PATCH و DELETE
  // ═════════════════════════════════════════════════════
  describe.each([
    ['PATCH', () => callPATCH({ content: 'متن جدید' }), 'update'],
    ['DELETE', () => callDELETE(), 'delete'],
  ] as const)('%s › auth', (_method, call, base) => {
    it.each([[null], [{ user: null }]])('should return 401 for session %j', async session => {
      getSession.mockResolvedValue(session);

      const res = await call();

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should NOT touch comments or permissions when unauthenticated', async () => {
      getSession.mockResolvedValue(null);

      await call();

      expect(getComment).not.toHaveBeenCalled();
      expect(userHasPermission).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
      expect(remove).not.toHaveBeenCalled();
    });

    it('should return 404 when the comment does not exist', async () => {
      getComment.mockResolvedValue(null);

      const res = await call();

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Comment not found' });
      expect(update).not.toHaveBeenCalled();
      expect(remove).not.toHaveBeenCalled();
    });

    it('should look the comment up by the route id', async () => {
      await call();

      expect(getComment).toHaveBeenCalledWith(ID);
    });

    it(`should ask for "${base}:own" when the user is the author`, async () => {
      getComment.mockResolvedValue(ownComment as any);

      await call();

      expect(userHasPermission).toHaveBeenCalledWith({
        headers: requestHeaders,
        body: { userId: 'user-1', permissions: { productComments: [`${base}:own`] } },
      });
    });

    it(`should ask for "${base}" when the user is NOT the author`, async () => {
      getComment.mockResolvedValue(othersComment as any);

      await call();

      expect(userHasPermission).toHaveBeenCalledWith({
        headers: requestHeaders,
        body: { userId: 'user-1', permissions: { productComments: [base] } },
      });
    });

    it(`should return 403 and NOT modify when the user lacks "${base}" on someone else's comment`, async () => {
      getComment.mockResolvedValue(othersComment as any);
      grant(`${base}:own`); // فقط مجوز کامنت خودش

      const res = await call();

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: 'Forbidden' });
      expect(update).not.toHaveBeenCalled();
      expect(remove).not.toHaveBeenCalled();
    });

    it(`should return 403 when the user lacks "${base}:own" on their own comment`, async () => {
      getComment.mockResolvedValue(ownComment as any);
      grant(base); // ادمین بدون مجوز :own

      expect((await call()).status).toBe(403);
    });

    it.each([[{ success: true, error: 'x' }], [{}]])(
      'should return 403 for permission result %j',
      async result => {
        userHasPermission.mockResolvedValue(result);

        expect((await call()).status).toBe(403);
      }
    );

    it("should treat a comment without an author (soft-deleted) as someone else's", async () => {
      getComment.mockResolvedValue({ id: ID, authorId: null, productId: 'p1' } as any);

      await call();

      expect(askedPermissions()[0]).toBe(base);
    });

    it('should return a generic 500 when the session lookup throws', async () => {
      getSession.mockRejectedValue(new Error('auth down'));

      const res = await call();

      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: 'Internal server error' });
    });

    it('should return 500 when the comment lookup throws', async () => {
      getComment.mockRejectedValue(new Error('DB down'));

      expect((await call()).status).toBe(500);
    });

    it('should return 500 when the permission check throws', async () => {
      userHasPermission.mockRejectedValue(new Error('permission down'));

      expect((await call()).status).toBe(500);
      expect(update).not.toHaveBeenCalled();
      expect(remove).not.toHaveBeenCalled();
    });
  });

  // ═════════════════════════════════════════════════════
  // PATCH
  // ═════════════════════════════════════════════════════
  describe('PATCH', () => {
    it('should log a warning for 401', async () => {
      getSession.mockResolvedValue(null);

      await callPATCH({ content: 'متن جدید' });

      expect(logger.warn).toHaveBeenCalledWith(`PATCH /api/product-comments/${ID} - Unauthorized`, {
        duration: expect.any(Number),
      });
    });

    it('should log a warning with userId for 403', async () => {
      grant();

      await callPATCH({ content: 'متن جدید' });

      expect(logger.warn).toHaveBeenCalledWith(`PATCH /api/product-comments/${ID} - Forbidden`, {
        userId: 'user-1',
        duration: expect.any(Number),
      });
    });

    it('should check permissions BEFORE validating the body (403 wins over 400)', async () => {
      grant();

      expect((await callPATCH({})).status).toBe(403);
    });

    describe('اعتبارسنجی (400)', () => {
      it('should return 400 with details for an empty object', async () => {
        const res = await callPATCH({});
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body).toEqual({
          error: 'Validation failed',
          details: [{ field: '', message: 'حداقل یک فیلد برای بروزرسانی الزامی است' }],
        });
      });

      it('should return 400 for too short content', async () => {
        const res = await callPATCH({ content: 'a' });
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.details[0].field).toBe('content');
      });

      it('should return 400 for an unknown status', async () => {
        expect((await callPATCH({ status: 'DELETED' })).status).toBe(400);
      });

      it('should return 400 when only unknown fields are sent', async () => {
        expect((await callPATCH({ authorId: 'evil' })).status).toBe(400);
        expect(update).not.toHaveBeenCalled();
      });

      it.each([null, 'text', 123, []])(
        'should return 400 for a non-object body (%j)',
        async body => {
          expect((await callPATCH(body)).status).toBe(400);
        }
      );
    });

    describe('ویرایش متن', () => {
      it('should update with the validated (trimmed) data and the route id', async () => {
        await callPATCH({ content: '   متن جدید   ' }, 'c-42');

        expect(update).toHaveBeenCalledTimes(1);
        expect(update).toHaveBeenCalledWith('c-42', { content: 'متن جدید' });
      });

      it('should strip unknown fields (no mass assignment)', async () => {
        await callPATCH({ content: 'متن جدید', authorId: 'evil', depth: 0, parentId: 'x' });

        expect(update).toHaveBeenCalledWith(ID, { content: 'متن جدید' });
      });

      it('should return the updated comment', async () => {
        update.mockResolvedValue({ id: ID, content: 'متن جدید' } as any);

        const res = await callPATCH({ content: 'متن جدید' });

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ id: ID, content: 'متن جدید' });
      });

      it('should log the update with commentId and userId', async () => {
        await callPATCH({ content: 'متن جدید' });

        expect(logger.info).toHaveBeenCalledWith(`PATCH /api/product-comments/${ID} - Updated`, {
          commentId: ID,
          userId: 'user-1',
          duration: expect.any(Number),
        });
      });

      it('should NOT ask for the "moderate" permission when status is not sent', async () => {
        await callPATCH({ content: 'متن جدید' });

        expect(askedPermissions()).toEqual(['update:own']);
      });
    });

    describe('تغییر status (moderation)', () => {
      it('should return 403 when the AUTHOR changes the status without "moderate"', async () => {
        getComment.mockResolvedValue(ownComment as any);
        grant('update:own');

        const res = await callPATCH({ status: 'APPROVED' });

        expect(res.status).toBe(403);
        expect(await res.json()).toEqual({ error: 'Forbidden: cannot change status' });
        expect(update).not.toHaveBeenCalled();
      });

      it('should ask for "moderate" after "update:own" when an author sends a status', async () => {
        getComment.mockResolvedValue(ownComment as any);

        await callPATCH({ status: 'APPROVED' });

        expect(askedPermissions()).toEqual(['update:own', 'moderate']);
      });

      it('should allow the author to change status when they have "moderate"', async () => {
        getComment.mockResolvedValue(ownComment as any);
        grant('update:own', 'moderate');

        const res = await callPATCH({ status: 'APPROVED' });

        expect(res.status).toBe(200);
        expect(update).toHaveBeenCalledWith(ID, { status: 'APPROVED' });
      });

      it('should also block a status change mixed with a content change', async () => {
        grant('update:own');

        const res = await callPATCH({ content: 'متن جدید', status: 'APPROVED' });

        expect(res.status).toBe(403);
        expect(update).not.toHaveBeenCalled();
      });

      it.each(['PENDING', 'APPROVED', 'REJECTED'])(
        'should accept status %s with "moderate"',
        async status => {
          const res = await callPATCH({ status });

          expect(res.status).toBe(200);
          expect(update).toHaveBeenCalledWith(ID, { status });
        }
      );

      it('should NOT ask for "moderate" when changing the status of someone else\'s comment (see notes)', async () => {
        getComment.mockResolvedValue(othersComment as any);
        grant('update'); // بدون moderate

        const res = await callPATCH({ status: 'REJECTED' });

        expect(res.status).toBe(200);
        expect(askedPermissions()).toEqual(['update']);
        expect(update).toHaveBeenCalledWith(ID, { status: 'REJECTED' });
      });
    });

    describe('خطا (500)', () => {
      it('should return a generic 500 and NOT leak the error message', async () => {
        update.mockRejectedValue(new Error('Record to update not found.'));

        const res = await callPATCH({ content: 'متن جدید' });
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body).toEqual({ error: 'Internal server error' });
        expect(JSON.stringify(body)).not.toContain('Record');
      });

      it('should log the error and "Unknown" for non-Error throws', async () => {
        update.mockRejectedValueOnce(new Error('DB down'));
        await callPATCH({ content: 'متن جدید' });
        expect(logger.error).toHaveBeenCalledWith(`PATCH /api/product-comments/${ID} failed`, {
          error: 'DB down',
          duration: expect.any(Number),
        });

        update.mockRejectedValueOnce('boom');
        await callPATCH({ content: 'متن جدید' });
        expect(logger.error).toHaveBeenLastCalledWith(
          `PATCH /api/product-comments/${ID} failed`,
          expect.objectContaining({ error: 'Unknown' })
        );
      });

      it('should return 500 for an invalid JSON body (see notes: should be 400)', async () => {
        const res = await PATCH(new NextRequest(URL_, { method: 'PATCH', body: '{bad' }), ctx());

        expect(res.status).toBe(500);
        expect(update).not.toHaveBeenCalled();
      });
    });
  });

  // ═════════════════════════════════════════════════════
  // DELETE
  // ═════════════════════════════════════════════════════
  describe('DELETE', () => {
    it('should delete using the route id', async () => {
      await callDELETE('c-42');

      expect(remove).toHaveBeenCalledTimes(1);
      expect(remove).toHaveBeenCalledWith('c-42');
    });

    it('should return { success: true }', async () => {
      const res = await callDELETE();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    });

    it('should return success for a soft delete as well (softDeleted is not exposed)', async () => {
      remove.mockResolvedValue({ success: true, softDeleted: true } as any);

      const res = await callDELETE();

      expect(await res.json()).toEqual({ success: true });
    });

    it("should allow an admin to delete someone else's comment", async () => {
      getComment.mockResolvedValue(othersComment as any);
      grant('delete');

      expect((await callDELETE()).status).toBe(200);
    });

    it('should log the deletion with commentId and userId', async () => {
      await callDELETE();

      expect(logger.info).toHaveBeenCalledWith(`DELETE /api/product-comments/${ID} - Deleted`, {
        commentId: ID,
        userId: 'user-1',
        duration: expect.any(Number),
      });
    });

    it('should NOT log anything for 401 / 403 (see notes)', async () => {
      getSession.mockResolvedValueOnce(null);
      await callDELETE();

      grant();
      await callDELETE();

      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should return a generic 500 and NOT leak the error message', async () => {
      remove.mockRejectedValue(new Error('Foreign key constraint failed on the field: parentId'));

      const res = await callDELETE();
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: 'Internal server error' });
      expect(JSON.stringify(body)).not.toContain('Foreign key');
    });

    it('should log the error and "Unknown" for non-Error throws', async () => {
      remove.mockRejectedValueOnce(new Error('DB down'));
      await callDELETE();
      expect(logger.error).toHaveBeenCalledWith(`DELETE /api/product-comments/${ID} failed`, {
        error: 'DB down',
        duration: expect.any(Number),
      });

      remove.mockRejectedValueOnce('boom');
      await callDELETE();
      expect(logger.error).toHaveBeenLastCalledWith(
        `DELETE /api/product-comments/${ID} failed`,
        expect.objectContaining({ error: 'Unknown' })
      );
    });
  });
});
