import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/blog/route';
import { auth } from '@/lib/auth';
import { getPublishedPosts } from '@/services/blog/db/queries';
import { createBlogPost } from '@/services/blog/db/mutations';

// موک کردن next/headers
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

function createRequest(url: string, method: string, body?: any): Request {
  return new Request(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  });
}

describe('/api/blog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // مقدار پیش‌فرض برای getSession (در صورت نیاز در تست‌های بعدی)
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

      const res = await GET(createRequest('http://localhost/api/blog?page=1&pageSize=10', 'GET'));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toHaveLength(1);
    });
  });

  describe('POST', () => {
    // توجه: اسکیمای createBlogSchema نیاز به فیلد slug دارد (الزامی)
    // همچنین status در صورت نبودن مقدار پیش‌فرض می‌گیرد، اما برای اطمینان می‌توان آن را نیز اضافه کرد.
    const validPayload = {
      title: 'عنوان تست',
      excerpt: 'خلاصه بلند برای تست (حداقل ۱۰ کاراکتر)',
      content:
        'محتوای بلند برای بلاگ که حتماً باید بیشتر از بیست کاراکتر باشد تا اعتبارسنجی قبول کند.',
      tags: ['تست'],
      slug: 'test-slug', // اضافه شد
      coverImageUrl: null,
      status: 'PUBLISHED', // اختیاری، اما بهتر است باشد
    };

    it('should return 401 without session', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const res = await POST(createRequest('http://localhost/api/blog', 'POST', validPayload));
      expect(res.status).toBe(401);
    });

    it('should return 403 without permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const res = await POST(createRequest('http://localhost/api/blog', 'POST', validPayload));
      expect(res.status).toBe(403);
    });

    it('should create a post when authorized', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (createBlogPost as any).mockResolvedValue({ id: '1', title: 'عنوان تست' });

      const res = await POST(createRequest('http://localhost/api/blog', 'POST', validPayload));
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.id).toBe('1');
    });
  });
});
