import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/brands/route';
import { auth } from '@/lib/auth';
import { getBrands } from '@/services/brands/db/queries';
import { createBrand } from '@/services/brands/db/mutations';

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

vi.mock('@/services/brands/db/queries', () => ({
  getBrands: vi.fn(),
}));

vi.mock('@/services/brands/db/mutations', () => ({
  createBrand: vi.fn(),
}));

// ساخت NextRequest به جای Request
function createNextRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost/api/brands';
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  // استفاده از type assertion برای رفع مشکل signal
  return new NextRequest(url, init as any);
}

describe('API /api/brands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return brands list with 200', async () => {
      const mockBrands = [{ id: '1', name: 'Brand A' }];
      (getBrands as any).mockResolvedValue(mockBrands);
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockBrands);
    });

    it('should return 500 on error', async () => {
      (getBrands as any).mockRejectedValue(new Error('DB error'));
      const res = await GET();
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST', () => {
    const validPayload = {
      name: 'New Brand',
      logo: 'https://example.com/logo.png',
      isActive: true,
    };

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
      const invalidPayload = { name: 'A' };
      const req = createNextRequest('POST', invalidPayload);
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
      expect(data.details[0].field).toBe('name');
    });

    it('should return 201 and created brand on success', async () => {
      const createdBrand = { id: '1', ...validPayload, slug: 'new-brand' };
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (createBrand as any).mockResolvedValue(createdBrand);
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual(createdBrand);
      expect(createBrand).toHaveBeenCalledWith(validPayload);
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
