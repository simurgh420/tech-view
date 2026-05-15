import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/wishlist/check/route';
import { auth } from '@/lib/auth';
import { isProductInWishlist } from '@/services/wishlist/db/queries';

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/services/wishlist/db/queries', () => ({
  isProductInWishlist: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function createNextRequest(url: string): NextRequest {
  return new NextRequest(url, { method: 'GET' } as any);
}

describe('API /api/wishlist/check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    const req = createNextRequest('http://localhost/api/wishlist/check?productId=123');
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 if productId is missing', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    const req = createNextRequest('http://localhost/api/wishlist/check');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('productId is required');
  });

  it('should return { inWishlist: true } if product is in wishlist', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    (isProductInWishlist as any).mockResolvedValue(true);
    const req = createNextRequest('http://localhost/api/wishlist/check?productId=prod-123');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ inWishlist: true });
    expect(isProductInWishlist).toHaveBeenCalledWith('u1', 'prod-123');
  });

  it('should return { inWishlist: false } if product is not in wishlist', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    (isProductInWishlist as any).mockResolvedValue(false);
    const req = createNextRequest('http://localhost/api/wishlist/check?productId=prod-123');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ inWishlist: false });
  });

  it('should return 500 on error', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    (isProductInWishlist as any).mockRejectedValue(new Error('DB error'));
    const req = createNextRequest('http://localhost/api/wishlist/check?productId=123');
    const res = await GET(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal server error');
  });
});
