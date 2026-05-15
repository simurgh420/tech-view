import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PATCH, DELETE } from '@/app/api/reviews/[id]/route';
import { auth } from '@/lib/auth';
import { getReviewById } from '@/services/reviews/db/queries';
import { updateReview, deleteReview } from '@/services/reviews/db/mutations';

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
  getReviewById: vi.fn(),
}));

vi.mock('@/services/reviews/db/mutations', () => ({
  updateReview: vi.fn(),
  deleteReview: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function createNextRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost/api/reviews/123';
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  return new NextRequest(url, init as any);
}

describe('API /api/reviews/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockReview = {
    id: '123',
    rating: 4,
    content: 'Good product',
    authorId: 'user-1',
  };
  const updatedReview = { ...mockReview, rating: 5, content: 'Excellent!' };

  describe('PATCH', () => {
    const validPayload = { rating: 5, content: 'Excellent!' };

    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(401);
    });

    it('should return 404 if review not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
      (getReviewById as any).mockResolvedValue(null);
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(404);
    });

    it('should return 403 if user has no permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'other-user' } });
      (getReviewById as any).mockResolvedValue(mockReview);
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(403);
    });

    it('should return 400 on validation error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
      (getReviewById as any).mockResolvedValue(mockReview);
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      const invalidPayload = { rating: 6 };
      const req = createNextRequest('PATCH', invalidPayload);
      const res = await PATCH(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should return 200 and updated review on success', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
      (getReviewById as any).mockResolvedValue(mockReview);
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (updateReview as any).mockResolvedValue(updatedReview);
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(updatedReview);
      expect(updateReview).toHaveBeenCalledWith('123', validPayload);
    });

    it('should return 500 on unexpected error', async () => {
      (auth.api.getSession as any).mockRejectedValue(new Error('Network'));
      const req = createNextRequest('PATCH', validPayload);
      const res = await PATCH(req, { params: Promise.resolve({ id: '123' }) });
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

    it('should return 404 if review not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
      (getReviewById as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(404);
    });

    it('should return 403 if user has no permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'other-user' } });
      (getReviewById as any).mockResolvedValue(mockReview);
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(403);
    });

    it('should return 200 and success on deletion', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
      (getReviewById as any).mockResolvedValue(mockReview);
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteReview as any).mockResolvedValue(undefined);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ success: true });
      expect(deleteReview).toHaveBeenCalledWith('123');
    });

    it('should return 500 on unexpected error', async () => {
      (auth.api.getSession as any).mockRejectedValue(new Error('Network'));
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(500);
    });
  });
});
