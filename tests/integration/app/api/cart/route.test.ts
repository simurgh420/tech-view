import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '@/app/api/cart/route';
import { auth } from '@/lib/auth';
import { getCart } from '@/services/cart/db/queries';
import { addCartItem, clearCart } from '@/services/cart/db/mutations';
import { CartErrors } from '@/services/cart/constants';

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

vi.mock('@/services/cart/db/queries', () => ({
  getCart: vi.fn(),
}));

vi.mock('@/services/cart/db/mutations', () => ({
  addCartItem: vi.fn(),
  clearCart: vi.fn(),
}));

function createNextRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost/api/cart';
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  return new NextRequest(url, init as any);
}

describe('API /api/cart', () => {
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

    it('should return cart items on success', async () => {
      const mockItems = [{ id: 'ci1', productId: 'p1', quantity: 2 }];
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (getCart as any).mockResolvedValue(mockItems);
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockItems);
    });

    it('should return 500 on error', async () => {
      (auth.api.getSession as any).mockRejectedValue(new Error('DB connection lost'));
      const res = await GET();
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST', () => {
    const validPayload = { productId: 'prod-123', quantity: 2 };

    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('should return 400 on validation error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      const invalidPayload = { productId: '', quantity: 0 };
      const req = createNextRequest('POST', invalidPayload);
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should return 404 if product not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (addCartItem as any).mockRejectedValue(new Error(CartErrors.PRODUCT_NOT_FOUND));
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Product not found');
    });

    it('should return 400 if insufficient stock', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (addCartItem as any).mockRejectedValue(new Error(CartErrors.INSUFFICIENT_STOCK));
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Insufficient stock');
    });

    it('should return 201 and created item on success', async () => {
      const mockItem = { id: 'ci1', productId: 'prod-123', quantity: 2 };
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (addCartItem as any).mockResolvedValue(mockItem);
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual(mockItem);
      expect(addCartItem).toHaveBeenCalledWith('u1', 'prod-123', 2);
    });

    it('should return 500 on unexpected error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (addCartItem as any).mockRejectedValue(new Error('Unknown error'));
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE', () => {
    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const res = await DELETE();
      expect(res.status).toBe(401);
    });

    it('should clear cart and return success', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (clearCart as any).mockResolvedValue(undefined);
      const res = await DELETE();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(clearCart).toHaveBeenCalledWith('u1');
    });

    it('should return 500 on error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (clearCart as any).mockRejectedValue(new Error('DB error'));
      const res = await DELETE();
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Internal server error');
    });
  });
});
