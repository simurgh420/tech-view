import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/reviews/route';
import { auth } from '@/lib/auth';
import { getReviewsByProductSlug } from '@/services/reviews/db/queries';
import { createReview } from '@/services/reviews/db/mutations';

// موک کردن وابستگی‌ها
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
  getReviewsByProductSlug: vi.fn(),
}));

vi.mock('@/services/reviews/db/mutations', () => ({
  createReview: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// تابع کمکی برای ساخت NextRequest
function createNextRequest(method: string, url: string, body?: any): NextRequest {
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  return new NextRequest(url, init as any);
}

describe('API /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 400 if product slug is missing', async () => {
      const req = createNextRequest('GET', 'http://localhost/api/reviews');
      const res = await GET(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Product slug is required');
    });

    it('should return reviews on success', async () => {
      const mockReviews = [{ id: '1', rating: 5, content: 'Great!' }];
      (getReviewsByProductSlug as any).mockResolvedValue(mockReviews);
      const req = createNextRequest('GET', 'http://localhost/api/reviews?product=test-product');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockReviews);
      expect(getReviewsByProductSlug).toHaveBeenCalledWith('test-product');
    });

    it('should return 500 on error', async () => {
      (getReviewsByProductSlug as any).mockRejectedValue(new Error('DB error'));
      const req = createNextRequest('GET', 'http://localhost/api/reviews?product=test');
      const res = await GET(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST', () => {
    const validPayload = {
      productSlug: 'test-product',
      rating: 5,
      content: 'This is a valid review with enough length.',
      title: 'Great product',
    };
    const createdReview = { id: 'r1', ...validPayload, authorId: 'u1' };

    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('POST', 'http://localhost/api/reviews', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 if no permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('POST', 'http://localhost/api/reviews', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toBe('Forbidden');
    });

    it('should return 400 on validation error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      const invalidPayload = { rating: 6 }; // missing productSlug and content
      const req = createNextRequest('POST', 'http://localhost/api/reviews', invalidPayload);
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should return 201 and created review on success', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (createReview as any).mockResolvedValue(createdReview);
      const req = createNextRequest('POST', 'http://localhost/api/reviews', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual(createdReview);
      expect(createReview).toHaveBeenCalledWith({
        ...validPayload,
        authorId: 'u1',
      });
    });

    it('should return 500 on unexpected error', async () => {
      (auth.api.getSession as any).mockRejectedValue(new Error('Network'));
      const req = createNextRequest('POST', 'http://localhost/api/reviews', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Internal server error');
    });
  });
});
