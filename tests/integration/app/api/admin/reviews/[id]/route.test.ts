import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, DELETE } from '@/app/api/admin/reviews/[id]/route';
import { auth } from '@/lib/auth';
import { getReviewByIdAdmin } from '@/services/reviews/db/queries';
import { deleteReview } from '@/services/reviews/db/mutations';

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

vi.mock('@/services/reviews/db/queries', () => ({
  getReviewByIdAdmin: vi.fn(),
}));

vi.mock('@/services/reviews/db/mutations', () => ({
  deleteReview: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function createNextRequest(method: string): NextRequest {
  const url = 'http://localhost/api/admin/reviews/123';
  const init: RequestInit = { method };
  return new NextRequest(url, init as any);
}

describe('API /api/admin/reviews/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockReview = {
    id: '123',
    rating: 5,
    content: 'Great product',
    user: { id: 'u1', name: 'John' },
    product: { id: 'p1', slug: 'test', title: 'Test' },
  };

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 if authenticated but no permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toBe('Forbidden');
    });

    it('should return 404 if review not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (getReviewByIdAdmin as any).mockResolvedValue(null);
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Review not found');
    });

    it('should return 200 and review on success', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (getReviewByIdAdmin as any).mockResolvedValue(mockReview);
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockReview);
    });

    it('should return 500 on error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (getReviewByIdAdmin as any).mockRejectedValue(new Error('DB error'));
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE', () => {
    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(401);
    });

    it('should return 403 if authenticated but no permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(403);
    });

    it('should return 404 if review not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (getReviewByIdAdmin as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Review not found');
    });

    it('should return 200 and success on deletion', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (getReviewByIdAdmin as any).mockResolvedValue(mockReview);
      (deleteReview as any).mockResolvedValue(undefined);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ success: true });
      expect(deleteReview).toHaveBeenCalledWith('123');
    });

    it('should return 500 on error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteReview as any).mockRejectedValue(new Error('DB error'));
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(500);
    });
  });
});
