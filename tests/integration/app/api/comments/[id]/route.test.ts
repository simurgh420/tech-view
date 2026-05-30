import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PUT, DELETE } from '@/app/api/comments/[id]/route';
import { auth } from '@/lib/auth';
import { getCommentById } from '@/services/comments/db/queries';
import { updateComment, deleteComment } from '@/services/comments/db/mutations';

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

vi.mock('@/services/comments/db/queries', () => ({
  getCommentById: vi.fn(),
}));

vi.mock('@/services/comments/db/mutations', () => ({
  updateComment: vi.fn(),
  deleteComment: vi.fn(),
}));

function createNextRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost/api/comments/123';
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  return new NextRequest(url, init as any);
}

describe('API /api/comments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockComment = {
    id: '123',
    content: 'Original content',
    rating: 5,
    authorId: 'user-1',
  };
  const updatedComment = { ...mockComment, content: 'Updated content', rating: 4 };

  describe('PUT', () => {
    const validPayload = { content: 'Updated content', rating: 4 };

    it('should return 401 without session', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('PUT', validPayload);
      const res = await PUT(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(401);
    });

    it('should return 404 if comment not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
      (getCommentById as any).mockResolvedValue(null);
      const req = createNextRequest('PUT', validPayload);
      const res = await PUT(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(404);
    });

    it('should return 403 if user has no permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'other-user' } });
      (getCommentById as any).mockResolvedValue(mockComment);
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('PUT', validPayload);
      const res = await PUT(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(403);
    });

    it('should return 400 on validation error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
      (getCommentById as any).mockResolvedValue(mockComment);
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      const invalidPayload = { rating: 6 }; // rating out of range (if schema limits 1-5)
      const req = createNextRequest('PUT', invalidPayload);
      const res = await PUT(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(400);
    });

    it('should return 200 and updated comment on success', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
      (getCommentById as any).mockResolvedValue(mockComment);
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (updateComment as any).mockResolvedValue(updatedComment);
      const req = createNextRequest('PUT', validPayload);
      const res = await PUT(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(updatedComment);
      expect(updateComment).toHaveBeenCalledWith('123', validPayload);
    });

    it('should return 500 on unexpected error', async () => {
      (auth.api.getSession as any).mockRejectedValue(new Error('DB fail'));
      const req = createNextRequest('PUT', validPayload);
      const res = await PUT(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE', () => {
    it('should return 401 without session', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(401);
    });

    it('should return 404 if comment not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
      (getCommentById as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(404);
    });

    it('should return 403 if user has no permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'other-user' } });
      (getCommentById as any).mockResolvedValue(mockComment);
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(403);
    });

    it('should return 200 and success on deletion', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
      (getCommentById as any).mockResolvedValue(mockComment);
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteComment as any).mockResolvedValue({ success: true });
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ success: true });
      expect(deleteComment).toHaveBeenCalledWith('123');
    });

    it('should return 500 on unexpected error', async () => {
      (auth.api.getSession as any).mockRejectedValue(new Error('DB fail'));
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(500);
    });
  });
});
