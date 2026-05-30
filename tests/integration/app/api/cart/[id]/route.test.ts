import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PATCH, DELETE } from '@/app/api/cart/[id]/route';
import { auth } from '@/lib/auth';
import { updateCartItemQuantity, removeCartItem } from '@/services/cart/db/mutations';
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

vi.mock('@/services/cart/db/mutations', () => ({
  updateCartItemQuantity: vi.fn(),
  removeCartItem: vi.fn(),
}));

function createNextRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost/api/cart/test-id';
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  return new NextRequest(url, init as any);
}

describe('API /api/cart/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PATCH', () => {
    const validPayload = { quantity: 3 };

    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ id: 'test-id' }) });
      expect(res.status).toBe(401);
    });

    it('should return 400 on validation error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      const invalidPayload = { quantity: 0 };
      const req = createNextRequest('PATCH', invalidPayload);
      const res = await PATCH(req, { params: Promise.resolve({ id: 'test-id' }) });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should return 404 if cart item not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (updateCartItemQuantity as any).mockResolvedValue(null);
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ id: 'test-id' }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Cart item not found');
    });

    it('should return 403 if user does not own cart item', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (updateCartItemQuantity as any).mockResolvedValue('forbidden');
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ id: 'test-id' }) });
      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: 'Forbidden' });
    });

    it('should return 400 if insufficient stock', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (updateCartItemQuantity as any).mockRejectedValue(new Error(CartErrors.INSUFFICIENT_STOCK));
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ id: 'test-id' }) });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Insufficient stock');
    });

    it('should return 200 and updated item on success', async () => {
      const updatedItem = { id: 'ci1', productId: 'p1', quantity: 3 };
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (updateCartItemQuantity as any).mockResolvedValue(updatedItem);
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ id: 'test-id' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(updatedItem);
      expect(updateCartItemQuantity).toHaveBeenCalledWith('test-id', 'u1', 3);
    });

    it('should return 500 on unexpected error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (updateCartItemQuantity as any).mockRejectedValue(new Error('DB crash'));
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ id: 'test-id' }) });
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE', () => {
    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: 'test-id' }) });
      expect(res.status).toBe(401);
    });

    it('should return 404 if cart item not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (removeCartItem as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: 'test-id' }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Cart item not found');
    });

    it('should return 403 if user does not own cart item', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (removeCartItem as any).mockResolvedValue('forbidden');
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: 'test-id' }) });
      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: 'Forbidden' });
    });

    it('should return 200 and success on successful deletion', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (removeCartItem as any).mockResolvedValue(true);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: 'test-id' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(removeCartItem).toHaveBeenCalledWith('test-id', 'u1');
    });

    it('should return 500 on unexpected error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (removeCartItem as any).mockRejectedValue(new Error('DB error'));
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: 'test-id' }) });
      expect(res.status).toBe(500);
    });
  });
});
