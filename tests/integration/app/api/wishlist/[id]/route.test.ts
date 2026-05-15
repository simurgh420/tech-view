import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE } from '@/app/api/wishlist/[id]/route';
import { auth } from '@/lib/auth';
import { getWishlistItemById } from '@/services/wishlist/db/queries';
import { removeFromWishlist } from '@/services/wishlist/db/mutations';

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/services/wishlist/db/queries', () => ({
  getWishlistItemById: vi.fn(),
}));

vi.mock('@/services/wishlist/db/mutations', () => ({
  removeFromWishlist: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function createNextRequest(method: string): NextRequest {
  const url = 'http://localhost/api/wishlist/123';
  const init: RequestInit = { method };
  return new NextRequest(url, init as any);
}

describe('API /api/wishlist/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockItem = { id: '123', userId: 'u1', productId: 'p1' };

  describe('DELETE', () => {
    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 if wishlist item not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (getWishlistItemById as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Wishlist item not found');
    });

    it('should return 403 if user does not own the item', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'other-user' } });
      (getWishlistItemById as any).mockResolvedValue(mockItem);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toBe('Forbidden');
    });

    it('should return 200 and success on deletion', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (getWishlistItemById as any).mockResolvedValue(mockItem);
      (removeFromWishlist as any).mockResolvedValue(undefined);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ success: true });
      expect(removeFromWishlist).toHaveBeenCalledWith('123');
    });

    it('should return 500 on error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (getWishlistItemById as any).mockRejectedValue(new Error('DB error'));
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Internal server error');
    });
  });
});
