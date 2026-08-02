import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE } from '@/app/api/wishlist/admin/clear/route';
import { auth } from '@/lib/auth';
import { clearWishlist } from '@/services/wishlist/db/mutations';

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

vi.mock('@/services/wishlist/db/mutations', () => ({
  clearWishlist: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function createNextRequest(url: string): NextRequest {
  return new NextRequest(url, { method: 'DELETE' } as any);
}

describe('API /api/admin/wishlist/clear (DELETE)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    const req = createNextRequest('http://localhost/api/admin/wishlist/clear?userId=u1');
    const res = await DELETE(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 403 if authenticated but no permission', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
    (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
    const req = createNextRequest('http://localhost/api/admin/wishlist/clear?userId=u1');
    const res = await DELETE(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe('Forbidden');
  });

  it('should return 400 if userId is missing', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
    (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
    const req = createNextRequest('http://localhost/api/admin/wishlist/clear');
    const res = await DELETE(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('userId is required');
  });

  it('should return 200 and success on clearing wishlist', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
    (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
    (clearWishlist as any).mockResolvedValue(undefined);
    const req = createNextRequest('http://localhost/api/admin/wishlist/clear?userId=u1');
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ success: true });
    expect(clearWishlist).toHaveBeenCalledWith('u1');
  });

  it('should return 500 on error', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
    (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
    (clearWishlist as any).mockRejectedValue(new Error('DB error'));
    const req = createNextRequest('http://localhost/api/admin/wishlist/clear?userId=u1');
    const res = await DELETE(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal server error');
  });
});
