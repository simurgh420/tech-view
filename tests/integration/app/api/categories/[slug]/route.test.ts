import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PATCH, DELETE } from '@/app/api/categories/[slug]/route';
import { auth } from '@/lib/auth';
import { getCategoryBySlug } from '@/services/categories/db/queries';
import { updateCategory, deleteCategory } from '@/services/categories/db/mutations';

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

vi.mock('@/services/categories/db/queries', () => ({
  getCategoryBySlug: vi.fn(),
}));

vi.mock('@/services/categories/db/mutations', () => ({
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

function createNextRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost/api/categories/test-slug';
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  return new NextRequest(url, init as any);
}

describe('API /api/categories/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    const mockCategory = { id: '1', title: 'Electronics', slug: 'electronics' };

    it('should return category when found', async () => {
      (getCategoryBySlug as any).mockResolvedValue(mockCategory);
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ slug: 'electronics' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockCategory);
    });

    it('should return 404 when not found', async () => {
      (getCategoryBySlug as any).mockResolvedValue(null);
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ slug: 'missing' }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('should return 500 on error', async () => {
      (getCategoryBySlug as any).mockRejectedValue(new Error('DB error'));
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(500);
    });
  });

  describe('PATCH', () => {
    const validPayload = { title: 'Updated Category' };
    const updatedCategory = { id: '1', title: 'Updated Category', slug: 'test-slug' };

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
      const invalidPayload = { title: '' };
      const req = createNextRequest('PATCH', invalidPayload);
      const res = await PATCH(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should return 404 if category not found during update', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (updateCategory as any).mockResolvedValue(null);
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ slug: 'missing' }) });
      expect(res.status).toBe(404);
    });

    it('should return 200 and updated category on success', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (updateCategory as any).mockResolvedValue(updatedCategory);
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(updatedCategory);
      expect(updateCategory).toHaveBeenCalledWith('test', validPayload);
    });

    it('should return 500 on unexpected error', async () => {
      (auth.api.getSession as any).mockRejectedValue(new Error('Network'));
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(500);
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

    it('should return 404 if category not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteCategory as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'missing' }) });
      expect(res.status).toBe(404);
    });

    it('should return 200 and success on deletion', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteCategory as any).mockResolvedValue({ id: '1' });
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(deleteCategory).toHaveBeenCalledWith('test');
    });

    it('should return 500 on error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteCategory as any).mockRejectedValue(new Error('DB failure'));
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(500);
    });
  });
});
