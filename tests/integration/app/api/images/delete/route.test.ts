import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/images/delete/route';
import { auth } from '@/lib/auth';
import { deleteImage } from '@/services/upload/deleteImage';

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

vi.mock('@/services/upload/deleteImage', () => ({
  deleteImage: vi.fn(),
}));

function createNextRequest(body?: any): NextRequest {
  const url = 'http://localhost/api/images/delete';
  const init: RequestInit = {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  return new NextRequest(url, init as any);
}

describe('API /api/images/delete (POST)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    const req = createNextRequest({ imagePath: 'test.jpg' });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 if imagePath is missing', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    const req = createNextRequest({}); // no imagePath
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Image path is required');
  });

  it('should return 400 if deleteImage returns false', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    (deleteImage as any).mockResolvedValue(false);
    const req = createNextRequest({ imagePath: 'test.jpg' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Failed to delete image');
  });

  it('should return 200 and success on successful deletion', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    (deleteImage as any).mockResolvedValue(true);
    const req = createNextRequest({ imagePath: 'test.jpg' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ success: true });
    expect(deleteImage).toHaveBeenCalledWith('test.jpg');
  });

  it('should return 500 on unexpected error', async () => {
    (auth.api.getSession as any).mockRejectedValue(new Error('DB error'));
    const req = createNextRequest({ imagePath: 'test.jpg' });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal server error');
  });
});
