import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/images/upload/route';
import { auth } from '@/lib/auth';
import { uploadImage } from '@/services/upload/uploadImage';

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

vi.mock('@/services/upload/uploadImage', () => ({
  uploadImage: vi.fn(),
}));

describe('API /api/images/upload (POST)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    const req = { formData: vi.fn() } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 if no file provided', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    const mockFormData = new FormData(); // empty
    const req = { formData: vi.fn().mockResolvedValue(mockFormData) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe('File is required');
  });

  it('should return 201 and imageUrl on successful upload', async () => {
    const mockImageUrl = 'https://cdn.example.com/uploads/test.jpg';
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    (uploadImage as any).mockResolvedValue(mockImageUrl);

    const mockFormData = new FormData();
    mockFormData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));
    mockFormData.append('folder', 'blogs/test');
    mockFormData.append('baseName', 'my-image');

    const req = { formData: vi.fn().mockResolvedValue(mockFormData) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.imageUrl).toBe(mockImageUrl);
    expect(uploadImage).toHaveBeenCalledWith(expect.any(File), 'blogs/test', 'my-image');
  });

  it('should return 500 on upload error', async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
    (uploadImage as any).mockRejectedValue(new Error('Upload failed'));

    const mockFormData = new FormData();
    mockFormData.append('file', new File(['test'], 'test.jpg'));
    const req = { formData: vi.fn().mockResolvedValue(mockFormData) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal server error');
  });
});
