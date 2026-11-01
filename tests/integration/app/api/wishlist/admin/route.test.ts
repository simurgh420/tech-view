//tests/unit/api/wishlist/admin/route.test.ts

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getAllWishlistItems } from '@/features/wishlist/server/queries';

import { GET } from '@/app/api/wishlist/admin/route';

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

vi.mock('@/features/wishlist/server/queries', () => ({
  getAllWishlistItems: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const mockHeaders = new Headers();

const mockWishlistItems = [
  {
    id: 'wishlist-1',
    userId: 'user-1',
    productId: 'product-1',
  },
  {
    id: 'wishlist-2',
    userId: 'user-2',
    productId: 'product-2',
  },
];

describe('GET /api/wishlist/admin', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(headers).mockResolvedValue(mockHeaders as never);

    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'admin-1' },
    } as never);

    vi.mocked(auth.api.userHasPermission).mockResolvedValue({
      success: true,
    } as never);

    vi.mocked(getAllWishlistItems).mockResolvedValue(mockWishlistItems as never);
  });

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(401);

      expect(body).toEqual({
        error: 'Unauthorized',
      });

      expect(auth.api.userHasPermission).not.toHaveBeenCalled();
      expect(getAllWishlistItems).not.toHaveBeenCalled();
    });
  });

  describe('Authorization', () => {
    it('should return 403 when permission check has an error', async () => {
      vi.mocked(auth.api.userHasPermission).mockResolvedValueOnce({
        success: false,
        error: new Error('Permission check failed'),
      } as never);

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(403);

      expect(body).toEqual({
        error: 'Forbidden',
      });

      expect(getAllWishlistItems).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have read permission', async () => {
      vi.mocked(auth.api.userHasPermission).mockResolvedValueOnce({
        success: false,
      } as never);

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(403);

      expect(body).toEqual({
        error: 'Forbidden',
      });

      expect(getAllWishlistItems).not.toHaveBeenCalled();
    });

    it('should check wishlist read permission for current user', async () => {
      await GET();

      expect(auth.api.userHasPermission).toHaveBeenCalledWith({
        headers: mockHeaders,
        body: {
          userId: 'admin-1',
          permissions: {
            wishlist: ['read'],
          },
        },
      });
    });
  });

  describe('Successful response', () => {
    it('should return all wishlist items with status 200', async () => {
      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(mockWishlistItems);

      expect(getAllWishlistItems).toHaveBeenCalledTimes(1);

      expect(logger.info).toHaveBeenCalledWith(
        'GET /api/wishlist/admin succeeded',
        expect.objectContaining({
          count: 2,
        })
      );
    });

    it('should return an empty array when there are no wishlist items', async () => {
      vi.mocked(getAllWishlistItems).mockResolvedValueOnce([] as never);

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual([]);

      expect(logger.info).toHaveBeenCalledWith(
        'GET /api/wishlist/admin succeeded',
        expect.objectContaining({
          count: 0,
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should return 500 when session retrieval fails', async () => {
      vi.mocked(auth.api.getSession).mockRejectedValueOnce(
        new Error('Session service unavailable')
      );

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(500);

      expect(body).toEqual({
        error: 'Internal server error',
      });

      expect(getAllWishlistItems).not.toHaveBeenCalled();
    });

    it('should return 500 when fetching wishlist items fails', async () => {
      vi.mocked(getAllWishlistItems).mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(500);

      expect(body).toEqual({
        error: 'Internal server error',
      });

      expect(logger.error).toHaveBeenCalledWith(
        'GET /api/wishlist/admin failed',
        expect.objectContaining({
          error: 'Database connection failed',
        })
      );
    });
  });
});
