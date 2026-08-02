import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/wishlist/admin/route';
import { auth } from '@/lib/auth';
import { getAllWishlistItems } from '@/services/wishlist/db/queries';

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

vi.mock('@/services/wishlist/db/queries', () => ({
  getAllWishlistItems: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('API /api/admin/wishlist (GET)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 403 if authenticated but no permission', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
    (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
    const res = await GET();
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe('Forbidden');
  });

  it('should return 200 and wishlist items on success', async () => {
    const mockItems = [
      { id: 'w1', userId: 'u1', productId: 'p1', product: { title: 'Product 1' } },
    ];
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
    (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
    (getAllWishlistItems as any).mockResolvedValue(mockItems);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockItems);
  });

  it('should return 500 on error', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
    (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
    (getAllWishlistItems as any).mockRejectedValue(new Error('DB error'));
    const res = await GET();
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal server error');
  });
});
