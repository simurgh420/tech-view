import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@/lib/auth';
import { getAllCommentsWithPost } from '@/services/comments/db/queries';
import { GET } from '@/app/api/comments/route';

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
  getAllCommentsWithPost: vi.fn(),
}));

describe('API /api/admin/comments (GET)', () => {
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
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin1' } });
    (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
    const res = await GET();
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe('Forbidden');
  });

  it('should return 200 and comments list on success', async () => {
    const mockComments = [
      { id: '1', content: 'Great post', post: { title: 'Post 1' } },
      { id: '2', content: 'Nice', post: { title: 'Post 2' } },
    ];
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin1' } });
    (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
    (getAllCommentsWithPost as any).mockResolvedValue(mockComments);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockComments);
  });

  it('should return 500 on unexpected error', async () => {
    (auth.api.getSession as any).mockRejectedValue(new Error('DB connection lost'));
    const res = await GET();
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal server error');
  });
});
