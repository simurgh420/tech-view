import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/admin/reviews/route';
import { auth } from '@/lib/auth';
import { getAllReviewsAdmin } from '@/services/reviews/db/queries';

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

vi.mock('@/services/reviews/db/queries', () => ({
  getAllReviewsAdmin: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('API /api/admin/reviews (GET)', () => {
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

  it('should return 200 and reviews on success', async () => {
    const mockReviews = [{ id: 'r1', rating: 5, content: 'Great', user: { name: 'John' } }];
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
    (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
    (getAllReviewsAdmin as any).mockResolvedValue(mockReviews);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockReviews);
  });

  it('should return 500 on error', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
    (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
    (getAllReviewsAdmin as any).mockRejectedValue(new Error('DB error'));
    const res = await GET();
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal server error');
  });
});
