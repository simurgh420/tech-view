import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '@/app/api/wishlist/route';
import { auth } from '@/lib/auth';
import { getWishlist } from '@/services/wishlist/db/queries';
import {
  addToWishlist,
  deleteWishlistItemByUserAndProduct,
} from '@/services/wishlist/db/mutations';

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      userHasPermission: vi.fn(),
    },
  },
}));

vi.mock('@/services/wishlist/db/queries', () => ({
  getWishlist: vi.fn(),
}));

vi.mock('@/services/wishlist/db/mutations', () => ({
  addToWishlist: vi.fn(),
  deleteWishlistItemByUserAndProduct: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function createNextRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost/api/wishlist';
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  return new NextRequest(url, init as any);
}

describe('API /api/wishlist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const res = await GET();
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return wishlist items on success', async () => {
      const mockItems = [{ id: 'w1', productId: 'p1' }];
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (getWishlist as any).mockResolvedValue(mockItems);
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockItems);
      expect(getWishlist).toHaveBeenCalledWith('u1');
    });

    it('should return 500 on error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (getWishlist as any).mockRejectedValue(new Error('DB error'));
      const res = await GET();
      expect(res.status).toBe(500);
    });
  });

  describe('POST', () => {
    const validPayload = { productId: 'prod-123' };
    const createdItem = { id: 'w1', userId: 'u1', productId: 'prod-123' };

    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('should return 403 if no permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it('should return 400 on validation error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      const invalidPayload = { productId: '' };
      const req = createNextRequest('POST', invalidPayload);
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should return 201 and created item on success', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (addToWishlist as any).mockResolvedValue(createdItem);
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual(createdItem);
      expect(addToWishlist).toHaveBeenCalledWith('u1', 'prod-123');
    });

    it('should return 500 on unexpected error', async () => {
      (auth.api.getSession as any).mockRejectedValue(new Error('Network'));
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE', () => {
    const validPayload = { productId: 'prod-123' };

    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE', validPayload);
      const res = await DELETE(req);
      expect(res.status).toBe(401);
    });

    it('should return 403 if no permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('DELETE', validPayload);
      const res = await DELETE(req);
      expect(res.status).toBe(403);
    });

    it('should return 400 on validation error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      const invalidPayload = { productId: '' };
      const req = createNextRequest('DELETE', invalidPayload);
      const res = await DELETE(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should return 200 and success on deletion', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteWishlistItemByUserAndProduct as any).mockResolvedValue(undefined);
      const req = createNextRequest('DELETE', validPayload);
      const res = await DELETE(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ success: true });
      expect(deleteWishlistItemByUserAndProduct).toHaveBeenCalledWith('u1', 'prod-123');
    });

    it('should return 500 on error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteWishlistItemByUserAndProduct as any).mockRejectedValue(new Error('DB error'));
      const req = createNextRequest('DELETE', validPayload);
      const res = await DELETE(req);
      expect(res.status).toBe(500);
    });
  });
});
