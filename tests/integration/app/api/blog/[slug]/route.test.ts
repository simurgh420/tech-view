// tests/integration/app/api/blog/[slug]/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/blog/[slug]/route';
import { auth } from '@/lib/auth';
import { getPostBySlug } from '@/services/blog/db/queries';
import { updatePost, deletePost } from '@/services/blog/db/mutations';
import prisma from '@/services/db/client';

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers({ cookie: 'test' })),
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      userHasPermission: vi.fn(),
    },
  },
}));

vi.mock('@/services/blog/db/queries', () => ({
  getPostBySlug: vi.fn(),
}));

vi.mock('@/services/blog/db/mutations', () => ({
  updatePost: vi.fn(),
  deletePost: vi.fn(),
}));

vi.mock('@/services/db/client', () => ({
  default: {
    blogPost: {
      findUnique: vi.fn(),
    },
  },
}));

// Helper to create NextRequest (bypass TS issue with signal)
function createNextRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost/api/blog/test-slug';
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  // Use type assertion to avoid signal property conflict
  return new NextRequest(url, init as any);
}

describe('API /api/blog/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return post when found', async () => {
      const mockPost = { id: '1', title: 'Test Post', slug: 'test-slug' };
      (getPostBySlug as any).mockResolvedValue(mockPost);
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ slug: 'test-slug' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockPost);
    });

    it('should return 404 when not found', async () => {
      (getPostBySlug as any).mockResolvedValue(null);
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ slug: 'not-exist' }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Not found');
    });

    it('should return 500 on error', async () => {
      (getPostBySlug as any).mockRejectedValue(new Error('DB error'));
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(500);
    });
  });

  describe('PUT', () => {
    // Valid payload that satisfies updateBlogSchema:
    // title min 3, content min 20, etc.
    const validPayload = {
      title: 'Updated Title',
      content: 'This content is definitely longer than twenty characters.',
      excerpt: 'Valid excerpt',
      tags: ['tag1'],
    };

    it('should return 401 without session', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('PUT', validPayload);
      const res = await PUT(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(401);
    });

    it('should return 404 if post not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (prisma.blogPost.findUnique as any).mockResolvedValue(null);
      const req = createNextRequest('PUT', validPayload);
      const res = await PUT(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(404);
    });

    it('should return 403 without permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (prisma.blogPost.findUnique as any).mockResolvedValue({ id: 'p1', authorId: 'other' });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('PUT', validPayload);
      const res = await PUT(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(403);
    });

    it('should return 400 on validation error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (prisma.blogPost.findUnique as any).mockResolvedValue({ id: 'p1', authorId: 'u1' });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      const invalidPayload = { title: '' }; // fails validation
      const req = createNextRequest('PUT', invalidPayload);
      const res = await PUT(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should return 200 and updated post on success', async () => {
      const updatedPost = { id: 'p1', title: 'Updated Title', slug: 'test' };
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (prisma.blogPost.findUnique as any).mockResolvedValue({ id: 'p1', authorId: 'u1' });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (updatePost as any).mockResolvedValue(updatedPost);
      const req = createNextRequest('PUT', validPayload);
      const res = await PUT(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(updatedPost);
    });
  });

  describe('DELETE', () => {
    it('should return 401 without session', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(401);
    });

    it('should return 404 if post not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (prisma.blogPost.findUnique as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(404);
    });

    it('should return 403 without permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (prisma.blogPost.findUnique as any).mockResolvedValue({ id: 'p1', authorId: 'other' });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(403);
    });

    it('should return 200 and success on deletion', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (prisma.blogPost.findUnique as any).mockResolvedValue({ id: 'p1', authorId: 'u1' });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deletePost as any).mockResolvedValue({ id: 'p1' });
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ slug: 'test' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});
