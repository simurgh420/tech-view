import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/blog/route';
import { auth } from '@/lib/auth';
import { getPublishedPosts } from '@/services/blog/db/queries';
import { createBlogPost } from '@/services/blog/db/mutations';

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

vi.mock('@/services/blog/db/queries', () => ({
  getPublishedPosts: vi.fn(),
}));

vi.mock('@/services/blog/db/mutations', () => ({
  createBlogPost: vi.fn(),
}));

// ساخت NextRequest با استفاده از type assertion برای رفع مشکل signal
function createNextRequest(url: string, method: string, body?: any): NextRequest {
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  return new NextRequest(url, init as any);
}

describe('/api/blog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
  });

  describe('GET', () => {
    it('should return paginated posts', async () => {
      (getPublishedPosts as any).mockResolvedValue({
        items: [{ id: '1', title: 'Post' }],
        total: 1,
        page: 1,
        pageSize: 10,
        pages: 1,
      });

      const req = createNextRequest('http://localhost/api/blog?page=1&pageSize=10', 'GET');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toHaveLength(1);
    });
  });

  describe('POST', () => {
    // payload مطابق با createBlogPayloadSchema (فقط فیلدهای فرم)
    const validPayload = {
      title: 'عنوان تست',
      excerpt: 'خلاصه بلند برای تست (حداقل ۱۰ کاراکتر)',
      content:
        'محتوای بلند برای بلاگ که حتماً باید بیشتر از بیست کاراکتر باشد تا اعتبارسنجی قبول کند.',
      tags: ['تست'],
      coverImageUrl: null,
    };

    it('should return 401 without session', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('http://localhost/api/blog', 'POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('should return 403 without permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('http://localhost/api/blog', 'POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it('should create a post when authorized', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (createBlogPost as any).mockResolvedValue({ id: '1', title: 'عنوان تست' });

      const req = createNextRequest('http://localhost/api/blog', 'POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.id).toBe('1');
    });
  });
});
