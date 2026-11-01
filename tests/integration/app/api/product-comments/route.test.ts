// @vitest-environment node
// tests/integration/app/api/product-comments/route.test.ts
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
  createComment: vi.fn(),
}));

vi.mock('@/features/product-comments/server/queries', () => ({
  getCommentsByProductSlug: vi.fn(),
}));

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { createComment } from '@/features/product-comments/server/mutations';
import { getCommentsByProductSlug } from '@/features/product-comments/server/queries';
import { ProductCommentErrors } from '@/features/product-comments/server/constants';
import { GET, POST } from '@/app/api/product-comments/route';

const getSession = auth.api.getSession as unknown as ReturnType<typeof vi.fn>;
const userHasPermission = auth.api.userHasPermission as unknown as ReturnType<typeof vi.fn>;
const create = vi.mocked(createComment);
const getComments = vi.mocked(getCommentsByProductSlug);

const requestHeaders = new Headers({ cookie: 'session=abc' });
const URL_ = 'http://localhost/api/product-comments';
const VALID_CUID = 'cjld2cjxh0000qzrmn831i7rn';

const validBody = { productSlug: 'iphone-15', content: 'محصول عالی است' };

const callGET = (query = '') => GET(new NextRequest(query ? `${URL_}?${query}` : URL_));

const callPOST = (body?: unknown) =>
  POST(
    new NextRequest(URL_, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  );

describe('/api/product-comments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(requestHeaders as any);
    getSession.mockResolvedValue({ user: { id: 'user-1', role: 'USER' } });
    userHasPermission.mockResolvedValue({ success: true, error: null });
    getComments.mockResolvedValue([] as any);
    create.mockResolvedValue({ id: 'c1' } as any);
  });

  // ═════════════════════════════════════════════════════
  // GET (عمومی)
  // ═════════════════════════════════════════════════════
  describe('GET', () => {
    it('should return 400 when the product param is missing', async () => {
      const res = await callGET();

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'Product slug is required' });
      expect(getComments).not.toHaveBeenCalled();
    });

    it('should return 400 when the product param is empty', async () => {
      expect((await callGET('product=')).status).toBe(400);
    });

    it('should log a warning when the product param is missing', async () => {
      await callGET();

      expect(logger.warn).toHaveBeenCalledWith('GET /api/product-comments - Missing product slug', {
        duration: expect.any(Number),
      });
    });

    it('should return the comment tree of the product', async () => {
      const tree = [{ id: 'c1', replies: [{ id: 'c2', replies: [] }] }];
      getComments.mockResolvedValue(tree as any);

      const res = await callGET('product=iphone-15');

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(tree);
    });

    it('should pass the slug and NEVER ask for unapproved comments', async () => {
      await callGET('product=iphone-15&includeUnapproved=true&status=PENDING');

      // دقیقاً یک آرگومان: includeUnapproved همیشه false می‌ماند
      expect(getComments).toHaveBeenCalledTimes(1);
      expect(getComments.mock.calls[0]).toEqual(['iphone-15']);
    });

    it('should decode Persian slugs from the query string', async () => {
      await callGET(`product=${encodeURIComponent('گوشی-موبایل')}`);

      expect(getComments).toHaveBeenCalledWith('گوشی-موبایل');
    });

    it('should return an empty array when the product has no comments', async () => {
      const res = await callGET('product=x');

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    });

    it('should NOT require authentication', async () => {
      getSession.mockResolvedValue(null);

      expect((await callGET('product=x')).status).toBe(200);
      expect(getSession).not.toHaveBeenCalled();
    });

    it('should log success with the product slug', async () => {
      await callGET('product=iphone-15');

      expect(logger.info).toHaveBeenCalledWith('GET /api/product-comments succeeded', {
        product: 'iphone-15',
        duration: expect.any(Number),
      });
    });

    it('should return a generic 500 and NOT leak the error message', async () => {
      getComments.mockRejectedValue(new Error('connection to db-prod-01 refused'));

      const res = await callGET('product=x');
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: 'Internal server error' });
      expect(JSON.stringify(body)).not.toContain('db-prod-01');
      expect(logger.error).toHaveBeenCalledWith('GET /api/product-comments failed', {
        error: 'connection to db-prod-01 refused',
        duration: expect.any(Number),
      });
    });

    it('should log "Unknown" for a non-Error throw', async () => {
      getComments.mockRejectedValue('boom');

      expect((await callGET('product=x')).status).toBe(500);
      expect(logger.error).toHaveBeenCalledWith(
        'GET /api/product-comments failed',
        expect.objectContaining({ error: 'Unknown' })
      );
    });
  });

  // ═════════════════════════════════════════════════════
  // POST
  // ═════════════════════════════════════════════════════
  describe('POST', () => {
    describe('احراز هویت و مجوز', () => {
      it.each([[null], [{ user: null }]])('should return 401 for session %j', async session => {
        getSession.mockResolvedValue(session);

        const res = await callPOST(validBody);

        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ error: 'Unauthorized' });
      });

      it('should NOT check permissions or create when unauthenticated', async () => {
        getSession.mockResolvedValue(null);

        await callPOST(validBody);

        expect(userHasPermission).not.toHaveBeenCalled();
        expect(create).not.toHaveBeenCalled();
      });

      it('should log a warning when unauthenticated', async () => {
        getSession.mockResolvedValue(null);

        await callPOST(validBody);

        expect(logger.warn).toHaveBeenCalledWith('POST /api/product-comments - Unauthorized', {
          duration: expect.any(Number),
        });
      });

      it('should check the "productComments:create" permission for the session user', async () => {
        await callPOST(validBody);

        expect(userHasPermission).toHaveBeenCalledWith({
          headers: requestHeaders,
          body: { userId: 'user-1', permissions: { productComments: ['create'] } },
        });
      });

      it.each([[{ success: false, error: null }], [{ success: true, error: 'x' }], [{}]])(
        'should return 403 for permission result %j',
        async result => {
          userHasPermission.mockResolvedValue(result);

          const res = await callPOST(validBody);

          expect(res.status).toBe(403);
          expect(await res.json()).toEqual({ error: 'Forbidden' });
          expect(create).not.toHaveBeenCalled();
        }
      );

      it('should log a warning with userId when forbidden', async () => {
        userHasPermission.mockResolvedValue({ success: false, error: null });

        await callPOST(validBody);

        expect(logger.warn).toHaveBeenCalledWith('POST /api/product-comments - Forbidden', {
          userId: 'user-1',
          duration: expect.any(Number),
        });
      });

      it('should check permissions BEFORE validating the body (403 wins over 400)', async () => {
        userHasPermission.mockResolvedValue({ success: false, error: null });

        expect((await callPOST({})).status).toBe(403);
      });
    });

    describe('اعتبارسنجی (400)', () => {
      it('should return 400 with field/message details', async () => {
        const res = await callPOST({ productSlug: '', content: 'a' });
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.error).toBe('Validation failed');
        expect(body.details).toEqual(
          expect.arrayContaining([
            { field: 'productSlug', message: 'شناسه محصول الزامی است' },
            { field: 'content', message: 'متن کامنت حداقل ۲ کاراکتر' },
          ])
        );
      });

      it('should reject an invalid parentId', async () => {
        const res = await callPOST({ ...validBody, parentId: 'not-a-cuid' });
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.details.map((d: any) => d.field)).toContain('parentId');
      });

      it('should reject content longer than 1000 characters', async () => {
        const res = await callPOST({ ...validBody, content: 'a'.repeat(1001) });

        expect(res.status).toBe(400);
      });

      it.each([null, 'text', 123, []])(
        'should return 400 for a non-object body (%j)',
        async body => {
          expect((await callPOST(body)).status).toBe(400);
          expect(create).not.toHaveBeenCalled();
        }
      );

      it('should NOT call createComment when validation fails', async () => {
        await callPOST({ productSlug: '', content: '' });

        expect(create).not.toHaveBeenCalled();
      });

      it('should log the validation issues as a warning', async () => {
        await callPOST({ ...validBody, content: 'a' });

        expect(logger.warn).toHaveBeenCalledWith('POST /api/product-comments - Validation failed', {
          errors: expect.arrayContaining([expect.objectContaining({ path: ['content'] })]),
          duration: expect.any(Number),
        });
      });
    });

    describe('ساخت دیدگاه', () => {
      it('should return the created comment with 201', async () => {
        create.mockResolvedValue({ id: 'c42', content: 'x' } as any);

        const res = await callPOST(validBody);

        expect(res.status).toBe(201);
        expect(await res.json()).toEqual({ id: 'c42', content: 'x' });
      });

      it('should create the comment with the validated data and the session user as author', async () => {
        await callPOST(validBody);

        expect(create).toHaveBeenCalledTimes(1);
        expect(create).toHaveBeenCalledWith({ ...validBody, authorId: 'user-1' });
      });

      it('should pass parentId through for replies', async () => {
        await callPOST({ ...validBody, parentId: VALID_CUID });

        expect(create).toHaveBeenCalledWith({
          ...validBody,
          parentId: VALID_CUID,
          authorId: 'user-1',
        });
      });

      it('should trim the content before saving', async () => {
        await callPOST({ ...validBody, content: '   سلام   ' });

        expect(create.mock.calls[0][0].content).toBe('سلام');
      });

      it('should take authorId from the session, NOT from the body', async () => {
        await callPOST({ ...validBody, authorId: 'evil-user' });

        expect(create.mock.calls[0][0].authorId).toBe('user-1');
      });

      it('should NOT let the client set status, depth or deletedAt', async () => {
        await callPOST({ ...validBody, status: 'APPROVED', depth: 0, deletedAt: null });

        const arg = create.mock.calls[0][0];
        expect(arg).not.toHaveProperty('status');
        expect(arg).not.toHaveProperty('depth');
        expect(arg).not.toHaveProperty('deletedAt');
      });

      it('should log creation with commentId and userId', async () => {
        await callPOST(validBody);

        expect(logger.info).toHaveBeenCalledWith('POST /api/product-comments - Comment created', {
          commentId: 'c1',
          userId: 'user-1',
          duration: expect.any(Number),
        });
      });
    });

    describe('خطاهای دامنه', () => {
      it('should return 400 with the Persian message for MAX_DEPTH_REACHED', async () => {
        create.mockRejectedValue(new Error('MAX_DEPTH_REACHED'));

        const res = await callPOST(validBody);

        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({
          error: 'حداکثر عمق پاسخ‌دهی به این دیدگاه رسیده است',
        });
      });

      it('should map the REAL ProductCommentErrors.MAX_DEPTH_REACHED to 400 (see notes)', async () => {
        create.mockRejectedValue(new Error(ProductCommentErrors.MAX_DEPTH_REACHED));

        expect((await callPOST(validBody)).status).toBe(400);
      });

      it.each(['PRODUCT_NOT_FOUND', 'PARENT_COMMENT_NOT_FOUND'] as const)(
        'should map the REAL ProductCommentErrors.%s to 404 (see notes)',
        async key => {
          create.mockRejectedValue(
            new Error((ProductCommentErrors as Record<string, string>)[key])
          );

          expect((await callPOST(validBody)).status).toBe(404);
        }
      );

      it('should return 404 with the message when the error message contains "not found"', async () => {
        create.mockRejectedValue(new Error('Product not found'));

        const res = await callPOST(validBody);

        expect(res.status).toBe(404);
        expect(await res.json()).toEqual({ error: 'Product not found' });
      });

      it('should return a Prisma error message verbatim with 404 when it contains "not found" (leak, see notes)', async () => {
        const message =
          'An operation failed because it depends on one or more records that were required but not found.';
        create.mockRejectedValue(new Error(message));

        const res = await callPOST(validBody);

        expect(res.status).toBe(404);
        expect(await res.json()).toEqual({ error: message });
      });

      it('should log business errors with logger.error (noise, see notes)', async () => {
        create.mockRejectedValue(new Error('MAX_DEPTH_REACHED'));

        await callPOST(validBody);

        expect(logger.error).toHaveBeenCalledWith('POST /api/product-comments failed', {
          error: 'MAX_DEPTH_REACHED',
          duration: expect.any(Number),
        });
      });
    });

    describe('خطای داخلی (500)', () => {
      it('should return a generic 500 and NOT leak the error message', async () => {
        create.mockRejectedValue(new Error('connection to db-prod-01 refused'));

        const res = await callPOST(validBody);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body).toEqual({ error: 'Internal server error' });
        expect(JSON.stringify(body)).not.toContain('db-prod-01');
      });

      it('should log "Unknown" for a non-Error throw', async () => {
        create.mockRejectedValue('boom');

        expect((await callPOST(validBody)).status).toBe(500);
        expect(logger.error).toHaveBeenCalledWith(
          'POST /api/product-comments failed',
          expect.objectContaining({ error: 'Unknown' })
        );
      });

      it('should return 500 when the session lookup throws', async () => {
        getSession.mockRejectedValue(new Error('auth down'));

        expect((await callPOST(validBody)).status).toBe(500);
        expect(create).not.toHaveBeenCalled();
      });

      it('should return 500 when the permission check throws', async () => {
        userHasPermission.mockRejectedValue(new Error('permission service down'));

        expect((await callPOST(validBody)).status).toBe(500);
        expect(create).not.toHaveBeenCalled();
      });

      it('should return 500 for an invalid JSON body (see notes: should be 400)', async () => {
        const res = await POST(new NextRequest(URL_, { method: 'POST', body: '{not json' }));

        expect(res.status).toBe(500);
        expect(create).not.toHaveBeenCalled();
      });
    });
  });
});
