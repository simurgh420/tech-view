import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/categories/route';
import { auth } from '@/lib/auth';
import { getCategories } from '@/services/categories/db/queries';
import { createCategory } from '@/services/categories/db/mutations';

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
  getCategories: vi.fn(),
}));

vi.mock('@/services/categories/db/mutations', () => ({
  createCategory: vi.fn(),
}));

function createNextRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost/api/categories';
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  return new NextRequest(url, init as any);
}

describe('API /api/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return categories list with 200', async () => {
      const mockCategories = [{ id: '1', name: 'Electronics' }];
      (getCategories as any).mockResolvedValue(mockCategories);
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockCategories);
    });

    it('should return 500 on error', async () => {
      (getCategories as any).mockRejectedValue(new Error('DB error'));
      const res = await GET();
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST', () => {
    const validPayload = { name: 'Clothing', slug: 'clothing', description: 'All clothing items' };

    it('should return 401 without session', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 without permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toBe('Forbidden');
    });

    it('should return 400 on validation error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      const invalidPayload = { name: '' }; // name too short
      const req = createNextRequest('POST', invalidPayload);
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should return 201 and created category on success', async () => {
      // ✅ payload صحیح مطابق اسکیما
      const validPayload = { title: 'Clothing' };

      // mock خروجی ساخته شده توسط سرور (شامل slug خودکار و id)
      const createdCategory = {
        id: '1',
        title: 'Clothing',
        slug: 'clothing', // توسط سرور از title ساخته می‌شود
        icon: null,
        parentId: null,
      };

      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (createCategory as any).mockResolvedValue(createdCategory);

      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual(createdCategory);
      expect(createCategory).toHaveBeenCalledWith(validPayload);
    });

    it('should return 500 on unexpected error', async () => {
      (auth.api.getSession as any).mockRejectedValue(new Error('Network'));
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Internal server error');
    });
  });
});
