//tests/unit/api/reviews/admin/[id]/route.test.ts

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

import { deleteReview } from '@/features/reviews/server/mutations';
import { getReviewByIdAdmin } from '@/features/reviews/server/queries';

import { GET, DELETE } from '@/app/api/reviews/admin/[id]/route';

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

vi.mock('@/features/reviews/server/mutations', () => ({
  deleteReview: vi.fn(),
}));

vi.mock('@/features/reviews/server/queries', () => ({
  getReviewByIdAdmin: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const reviewId = 'review-1';
const mockHeaders = new Headers();

const mockReview = {
  id: reviewId,
  rating: 5,
  comment: 'Excellent product',
};

const createRequest = () => new NextRequest(`http://localhost/api/reviews/admin/${reviewId}`);

const createContext = () => ({
  params: Promise.resolve({ id: reviewId }),
});

describe('/api/reviews/admin/[id]', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(headers).mockResolvedValue(mockHeaders as never);

    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'admin-1' },
    } as never);

    vi.mocked(auth.api.userHasPermission).mockResolvedValue({
      success: true,
    } as never);

    vi.mocked(getReviewByIdAdmin).mockResolvedValue(mockReview as never);

    vi.mocked(deleteReview).mockResolvedValue(undefined as never);
  });

  // =========================
  // GET
  // =========================

  describe('GET', () => {
    describe('Authentication', () => {
      it('should return 401 when user is not authenticated', async () => {
        vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

        const response = await GET(createRequest(), createContext());
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body).toEqual({
          error: 'Unauthorized',
        });

        expect(auth.api.userHasPermission).not.toHaveBeenCalled();
        expect(getReviewByIdAdmin).not.toHaveBeenCalled();
      });
    });

    describe('Authorization', () => {
      it('should return 403 when permission check has an error', async () => {
        vi.mocked(auth.api.userHasPermission).mockResolvedValueOnce({
          success: false,
          error: new Error('Permission check failed'),
        } as never);

        const response = await GET(createRequest(), createContext());
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body).toEqual({
          error: 'Forbidden',
        });

        expect(getReviewByIdAdmin).not.toHaveBeenCalled();
      });

      it('should return 403 when user does not have read permission', async () => {
        vi.mocked(auth.api.userHasPermission).mockResolvedValueOnce({
          success: false,
        } as never);

        const response = await GET(createRequest(), createContext());

        expect(response.status).toBe(403);
        expect(getReviewByIdAdmin).not.toHaveBeenCalled();
      });

      it('should check reviews read permission for current user', async () => {
        await GET(createRequest(), createContext());

        expect(auth.api.userHasPermission).toHaveBeenCalledWith({
          headers: mockHeaders,
          body: {
            userId: 'admin-1',
            permissions: {
              reviews: ['read'],
            },
          },
        });
      });
    });

    describe('Review retrieval', () => {
      it('should return review when it exists', async () => {
        const response = await GET(createRequest(), createContext());
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual(mockReview);

        expect(getReviewByIdAdmin).toHaveBeenCalledWith(reviewId);
      });

      it('should return 404 when review does not exist', async () => {
        vi.mocked(getReviewByIdAdmin).mockResolvedValueOnce(null as never);

        const response = await GET(createRequest(), createContext());
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body).toEqual({
          error: 'Review not found',
        });
      });
    });

    describe('Error handling', () => {
      it('should return 500 when fetching review fails', async () => {
        vi.mocked(getReviewByIdAdmin).mockRejectedValueOnce(new Error('Database error'));

        const response = await GET(createRequest(), createContext());
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          error: 'Internal server error',
        });

        expect(logger.error).toHaveBeenCalledWith(
          `GET /api/reviews/admin/${reviewId} failed`,
          expect.objectContaining({
            error: 'Database error',
          })
        );
      });
    });
  });

  // =========================
  // DELETE
  // =========================

  describe('DELETE', () => {
    describe('Authentication', () => {
      it('should return 401 when user is not authenticated', async () => {
        vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

        const response = await DELETE(createRequest(), createContext());
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body).toEqual({
          error: 'Unauthorized',
        });

        expect(auth.api.userHasPermission).not.toHaveBeenCalled();
        expect(getReviewByIdAdmin).not.toHaveBeenCalled();
        expect(deleteReview).not.toHaveBeenCalled();
      });
    });

    describe('Authorization', () => {
      it('should return 403 when user does not have delete permission', async () => {
        vi.mocked(auth.api.userHasPermission).mockResolvedValueOnce({
          success: false,
        } as never);

        const response = await DELETE(createRequest(), createContext());

        expect(response.status).toBe(403);
        expect(getReviewByIdAdmin).not.toHaveBeenCalled();
        expect(deleteReview).not.toHaveBeenCalled();
      });

      it('should check reviews delete permission for current user', async () => {
        await DELETE(createRequest(), createContext());

        expect(auth.api.userHasPermission).toHaveBeenCalledWith({
          headers: mockHeaders,
          body: {
            userId: 'admin-1',
            permissions: {
              reviews: ['delete'],
            },
          },
        });
      });
    });

    describe('Review deletion', () => {
      it('should return 404 when review does not exist', async () => {
        vi.mocked(getReviewByIdAdmin).mockResolvedValueOnce(null as never);

        const response = await DELETE(createRequest(), createContext());
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body).toEqual({
          error: 'Review not found',
        });

        expect(deleteReview).not.toHaveBeenCalled();
      });

      it('should delete review successfully', async () => {
        const response = await DELETE(createRequest(), createContext());
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({
          success: true,
        });

        expect(getReviewByIdAdmin).toHaveBeenCalledWith(reviewId);
        expect(deleteReview).toHaveBeenCalledWith(reviewId);
      });
    });

    describe('Error handling', () => {
      it('should return 500 when deleting review fails', async () => {
        vi.mocked(deleteReview).mockRejectedValueOnce(new Error('Delete failed'));

        const response = await DELETE(createRequest(), createContext());
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          error: 'Internal server error',
        });

        expect(logger.error).toHaveBeenCalledWith(
          `DELETE /api/reviews/admin/${reviewId} failed`,
          expect.objectContaining({
            error: 'Delete failed',
          })
        );
      });

      it('should return 500 when checking existing review fails', async () => {
        vi.mocked(getReviewByIdAdmin).mockRejectedValueOnce(new Error('Database error'));

        const response = await DELETE(createRequest(), createContext());
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          error: 'Internal server error',
        });

        expect(deleteReview).not.toHaveBeenCalled();
      });
    });
  });
});
