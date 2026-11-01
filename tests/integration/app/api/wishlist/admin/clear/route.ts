//tests/unit/api/wishlist/admin/route.test.ts

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { clearWishlist } from '@/features/wishlist/server/mutations';

import { DELETE } from '@/app/api/wishlist/admin/clear/route';

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

vi.mock('@/features/wishlist/server/mutations', () => ({
  clearWishlist: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const mockHeaders = new Headers();
const userId = 'user-1';

const createRequest = (id?: string) =>
  new NextRequest(
    id
      ? `http://localhost/api/wishlist/admin/clear?userId=${id}`
      : 'http://localhost/api/wishlist/admin/clear'
  );

describe('DELETE /api/wishlist/admin/clear', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(headers).mockResolvedValue(mockHeaders as never);

    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'admin-1' },
    } as never);

    vi.mocked(auth.api.userHasPermission).mockResolvedValue({
      success: true,
    } as never);

    vi.mocked(clearWishlist).mockResolvedValue(undefined as never);
  });

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

      const response = await DELETE(createRequest(userId));
      const body = await response.json();

      expect(response.status).toBe(401);

      expect(body).toEqual({
        error: 'Unauthorized',
      });

      expect(auth.api.userHasPermission).not.toHaveBeenCalled();
      expect(clearWishlist).not.toHaveBeenCalled();
    });
  });

  describe('Authorization', () => {
    it('should return 403 when permission check has an error', async () => {
      vi.mocked(auth.api.userHasPermission).mockResolvedValueOnce({
        success: false,
        error: new Error('Permission check failed'),
      } as never);

      const response = await DELETE(createRequest(userId));
      const body = await response.json();

      expect(response.status).toBe(403);

      expect(body).toEqual({
        error: 'Forbidden',
      });

      expect(clearWishlist).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have delete permission', async () => {
      vi.mocked(auth.api.userHasPermission).mockResolvedValueOnce({
        success: false,
      } as never);

      const response = await DELETE(createRequest(userId));

      expect(response.status).toBe(403);
      expect(clearWishlist).not.toHaveBeenCalled();
    });

    it('should check wishlist delete permission for current user', async () => {
      await DELETE(createRequest(userId));

      expect(auth.api.userHasPermission).toHaveBeenCalledWith({
        headers: mockHeaders,
        body: {
          userId: 'admin-1',
          permissions: {
            wishlist: ['delete'],
          },
        },
      });
    });
  });

  describe('Input validation', () => {
    it('should return 400 when userId is missing', async () => {
      const response = await DELETE(createRequest());
      const body = await response.json();

      expect(response.status).toBe(400);

      expect(body).toEqual({
        error: 'userId is required',
      });

      expect(clearWishlist).not.toHaveBeenCalled();
    });
  });

  describe('Successful deletion', () => {
    it('should clear wishlist for the specified user', async () => {
      const response = await DELETE(createRequest(userId));
      const body = await response.json();

      expect(response.status).toBe(200);

      expect(body).toEqual({
        success: true,
      });

      expect(clearWishlist).toHaveBeenCalledTimes(1);
      expect(clearWishlist).toHaveBeenCalledWith(userId);
    });

    it('should log successful deletion with admin and user IDs', async () => {
      await DELETE(createRequest(userId));

      expect(logger.info).toHaveBeenCalledWith(
        'DELETE /api/wishlist/admin/clear - Cleared',
        expect.objectContaining({
          adminId: 'admin-1',
          userId,
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should return 500 when session retrieval fails', async () => {
      vi.mocked(auth.api.getSession).mockRejectedValueOnce(
        new Error('Session service unavailable')
      );

      const response = await DELETE(createRequest(userId));
      const body = await response.json();

      expect(response.status).toBe(500);

      expect(body).toEqual({
        error: 'Internal server error',
      });

      expect(clearWishlist).not.toHaveBeenCalled();
    });

    it('should return 500 when permission check throws an error', async () => {
      vi.mocked(auth.api.userHasPermission).mockRejectedValueOnce(
        new Error('Permission service unavailable')
      );

      const response = await DELETE(createRequest(userId));
      const body = await response.json();

      expect(response.status).toBe(500);

      expect(body).toEqual({
        error: 'Internal server error',
      });

      expect(clearWishlist).not.toHaveBeenCalled();
    });

    it('should return 500 when clearing wishlist fails', async () => {
      vi.mocked(clearWishlist).mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await DELETE(createRequest(userId));
      const body = await response.json();

      expect(response.status).toBe(500);

      expect(body).toEqual({
        error: 'Internal server error',
      });

      expect(logger.error).toHaveBeenCalledWith(
        'DELETE /api/wishlist/admin/clear failed',
        expect.objectContaining({
          error: 'Database connection failed',
        })
      );
    });
  });
});
