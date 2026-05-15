import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/contact/route';
import { auth } from '@/lib/auth';
import { getContacts } from '@/services/contact/db/queries';
import { createContact } from '@/services/contact/db/mutations';

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
  getContacts: vi.fn(),
}));

vi.mock('@/services/contact/db/mutations', () => ({
  createContact: vi.fn(),
}));

function createNextRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost/api/contact';
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  return new NextRequest(url, init as any);
}

describe('API /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
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

    it('should return 200 and contacts list on success', async () => {
      const mockContacts = [{ id: '1', name: 'John', email: 'john@example.com' }];
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (getContacts as any).mockResolvedValue(mockContacts);
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockContacts);
    });

    it('should return 500 on error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'admin' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (getContacts as any).mockRejectedValue(new Error('DB error'));
      const res = await GET();
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST', () => {
    const validPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '09123456789', // اضافه شد (حداقل ۱۰ رقم)
      subject: 'Test Subject', // اضافه شد
      message: 'Hello, I have a question.',
    };

    it('should return 201 and success for anonymous user', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      (createContact as any).mockResolvedValue(undefined);
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual({ success: true });
      expect(createContact).toHaveBeenCalledWith({ ...validPayload, userId: null });
    });

    it('should return 201 and success for authenticated user', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'user-1' } });
      (createContact as any).mockResolvedValue(undefined);
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(201);
      expect(createContact).toHaveBeenCalledWith({ ...validPayload, userId: 'user-1' });
    });

    it('should return 400 on validation error', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const invalidPayload = { name: 'J', email: 'invalid', message: '' };
      const req = createNextRequest('POST', invalidPayload);
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should return 500 on unexpected error', async () => {
      (auth.api.getSession as any).mockRejectedValue(new Error('Network error'));
      const req = createNextRequest('POST', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Internal server error');
    });
  });
});
