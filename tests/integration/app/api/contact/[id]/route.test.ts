import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, DELETE } from '@/app/api/contact/[id]/route';
import { auth } from '@/lib/auth';
import { getContactById } from '@/services/contact/db/queries';
import { deleteContact } from '@/services/contact/db/mutations';

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

vi.mock('@/services/contact/db/queries', () => ({
  getContactById: vi.fn(),
}));

vi.mock('@/services/contact/db/mutations', () => ({
  deleteContact: vi.fn(),
}));

function createNextRequest(method: string): NextRequest {
  const url = 'http://localhost/api/contact/123';
  const init: RequestInit = { method };
  return new NextRequest(url, init as any);
}

describe('API /api/contact/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockContact = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '09123456789',
    subject: 'Question',
    message: 'Hello',
  };

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(401);
    });

    it('should return 403 if authenticated but no permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(403);
    });

    it('should return 404 if contact not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (getContactById as any).mockResolvedValue(null);
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Contact not found');
    });

    it('should return 200 and contact on success', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (getContactById as any).mockResolvedValue(mockContact);
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockContact);
    });

    it('should return 500 on error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (getContactById as any).mockRejectedValue(new Error('DB error'));
      const req = createNextRequest('GET');
      const res = await GET(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE', () => {
    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(401);
    });

    it('should return 403 if authenticated but no permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(403);
    });

    it('should return 404 if contact not found', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteContact as any).mockResolvedValue(null);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Contact not found');
    });

    it('should return 200 and success on deletion', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteContact as any).mockResolvedValue(true);
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ success: true });
    });

    it('should return 500 on error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (deleteContact as any).mockRejectedValue(new Error('DB error'));
      const req = createNextRequest('DELETE');
      const res = await DELETE(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(500);
    });
  });
});
