import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/posts/[postId]/comments/route';
import { auth } from '@/lib/auth';
import { getCommentsByPostId } from '@/services/comments/db/queries';
import { createComment } from '@/services/comments/db/mutations';
import prisma from '@/services/db/client';

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
  getCommentsByPostId: vi.fn(),
}));

vi.mock('@/services/comments/db/mutations', () => ({
  createComment: vi.fn(),
}));

vi.mock('@/services/db/client', () => ({
  default: {
    blogPost: {
      findUnique: vi.fn(),
    },
  },
}));

function createNextRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost/api/posts/post-123/comments';
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  return new NextRequest(url, init as any);
}

describe('API /api/posts/[postId]/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return comments for the post', async () => {
      const mockComments = [{ id: 'c1', content: 'Great!', author: { name: 'John' } }];
      (getCommentsByPostId as any).mockResolvedValue(mockComments);
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ postId: 'post-123' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockComments);
      expect(getCommentsByPostId).toHaveBeenCalledWith('post-123');
    });

    it('should return 500 on error', async () => {
      (getCommentsByPostId as any).mockRejectedValue(new Error('DB fail'));
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ postId: 'post-123' }) });
      expect(res.status).toBe(500);
    });
  });

  describe('POST', () => {
    const validPayload = { content: 'Nice post!', rating: 5 };
    const mockPost = { id: 'post-123', title: 'Test Post' };
    const mockComment = { id: 'c1', content: 'Nice post!', rating: 5 };

    it('should return 401 without session', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req, { params: Promise.resolve({ postId: 'post-123' }) });
      expect(res.status).toBe(401);
    });

    it('should return 403 without permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req, { params: Promise.resolve({ postId: 'post-123' }) });
      expect(res.status).toBe(403);
    });

    it('should return 404 if post not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (prisma.blogPost.findUnique as any).mockResolvedValue(null);
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req, { params: Promise.resolve({ postId: 'missing' }) });
      expect(res.status).toBe(404);
    });

    it('should return 400 on validation error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (prisma.blogPost.findUnique as any).mockResolvedValue(mockPost);
      const invalidPayload = { rating: 6 }; // rating out of range (assuming 1-5)
      const req = createNextRequest('POST', invalidPayload);
      const res = await POST(req, { params: Promise.resolve({ postId: 'post-123' }) });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should return 201 and created comment on success', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (prisma.blogPost.findUnique as any).mockResolvedValue(mockPost);
      (createComment as any).mockResolvedValue(mockComment);
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req, { params: Promise.resolve({ postId: 'post-123' }) });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual(mockComment);
      expect(createComment).toHaveBeenCalledWith({
        postId: 'post-123',
        authorId: 'u1',
        content: 'Nice post!',
        rating: 5,
      });
    });

    it('should return 500 on unexpected error', async () => {
      (auth.api.getSession as any).mockRejectedValue(new Error('Network'));
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req, { params: Promise.resolve({ postId: 'post-123' }) });
      expect(res.status).toBe(500);
    });
  });
});
