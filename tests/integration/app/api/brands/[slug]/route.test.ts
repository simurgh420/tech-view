import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PATCH, DELETE } from '@/app/api/brands/[slug]/route';
import { auth } from '@/lib/auth';
import { getBrandBySlug } from '@/services/brands/db/queries';
import { updateBrandBySlug, deleteBrandBySlug } from '@/services/brands/db/mutations';

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

vi.mock('@/services/brands/db/queries', () => ({
  getBrandBySlug: vi.fn(),
}));

vi.mock('@/services/brands/db/mutations', () => ({
  updateBrandBySlug: vi.fn(),
  deleteBrandBySlug: vi.fn(),
}));

function createNextRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost/api/brands/test-slug';
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  return new NextRequest(url, init as any);
}

describe('API /api/brands/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return brand when found', async () => {
      const mockBrand = { id: '1', name: 'Test Brand', slug: 'test-slug' };
      (getBrandBySlug as any).mockResolvedValue(mockBrand);
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ slug: 'test-slug' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockBrand);
    });

    it('should return 404 when not found', async () => {
      (getBrandBySlug as any).mockResolvedValue(null);
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ slug: 'not-exist' }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Brand not found');
    });

    it('should return 500 on error', async () => {
      (getBrandBySlug as any).mockRejectedValue(new Error('DB error'));
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(500);
    });
  });

  describe('PATCH', () => {
    const validPayload = { name: 'Updated Brand' };

    it('should return 401 without session', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(401);
    });

    it('should return 403 without permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(403);
    });

    it('should return 400 on validation error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      const invalidPayload = { name: 'A' };
      const req = createNextRequest('PATCH', invalidPayload);
      const res = await PATCH(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should return 200 on success', async () => {
      const updatedBrand = { id: '1', name: 'Updated Brand', slug: 'test' };
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (updateBrandBySlug as any).mockResolvedValue(updatedBrand);
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(updatedBrand);
    });
  });

  describe('DELETE', () => {
    it('should return 401 without session', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(401);
    });

    it('should return 403 without permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(403);
    });

    it('should return 404 if brand not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteBrandBySlug as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Brand not found');
    });

    it('should return 200 on success', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteBrandBySlug as any).mockResolvedValue({ success: true });
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});
