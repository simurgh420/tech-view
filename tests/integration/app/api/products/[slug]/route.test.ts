import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PATCH, DELETE } from '@/app/api/products/[slug]/route';
import { auth } from '@/lib/auth';
import { getProductBySlug } from '@/services/products/db/queries';
import { updateProduct, deleteProduct } from '@/services/products/db/mutations';
import { logger } from '@/lib/logger';

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

vi.mock('@/services/products/db/queries', () => ({
  getProductBySlug: vi.fn(),
}));

vi.mock('@/services/products/db/mutations', () => ({
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function createNextRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost/api/products/test-slug';
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  return new NextRequest(url, init as any);
}

describe('API /api/products/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProduct = { id: 'p1', slug: 'test-slug', title: 'Test Product' };
  const updatedProduct = { ...mockProduct, title: 'Updated Product' };

  describe('GET', () => {
    it('should return product when found', async () => {
      (getProductBySlug as any).mockResolvedValue(mockProduct);
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ slug: 'test-slug' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockProduct);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should return 404 if not found', async () => {
      (getProductBySlug as any).mockResolvedValue(null);
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ slug: 'missing' }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Product not found');
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      (getProductBySlug as any).mockRejectedValue(new Error('DB error'));
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(500);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('PATCH', () => {
    const validPayload = { title: 'Updated Product' };

    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ slug: 'test-slug' }) });
      expect(res.status).toBe(401);
    });

    it('should return 403 if no permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ slug: 'test-slug' }) });
      expect(res.status).toBe(403);
    });

    it('should return 400 on validation error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      const invalidPayload = { title: '' };
      const req = createNextRequest('PATCH', invalidPayload);
      const res = await PATCH(req, { params: Promise.resolve({ slug: 'test-slug' }) });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should return 404 if product not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (updateProduct as any).mockResolvedValue(null);
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ slug: 'missing' }) });
      expect(res.status).toBe(404);
    });

    it('should return 200 and updated product on success', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (updateProduct as any).mockResolvedValue(updatedProduct);
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ slug: 'test-slug' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(updatedProduct);
      expect(updateProduct).toHaveBeenCalledWith('test-slug', validPayload);
    });

    it('should return 409 on duplicate slug', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      const error = new Error('Slug already taken');
      (updateProduct as any).mockRejectedValue(error);
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ slug: 'test-slug' }) });
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toBe('Slug already taken');
    });
  });

  describe('DELETE', () => {
    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'test-slug' }) });
      expect(res.status).toBe(401);
    });

    it('should return 403 if no permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'test-slug' }) });
      expect(res.status).toBe(403);
    });

    it('should return 404 if product not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteProduct as any).mockResolvedValue(false);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'missing' }) });
      expect(res.status).toBe(404);
    });

    it('should return 200 and success on deletion', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteProduct as any).mockResolvedValue(true);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'test-slug' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ success: true });
      expect(deleteProduct).toHaveBeenCalledWith('test-slug');
    });

    it('should return 500 on error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteProduct as any).mockRejectedValue(new Error('DB error'));
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'test-slug' }) });
      expect(res.status).toBe(500);
    });
  });
});
