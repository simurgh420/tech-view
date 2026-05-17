// tests/integration/app/api/products/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/products/route';
import { auth } from '@/lib/auth';
import { getProducts, getFilteredProducts } from '@/services/products/db/queries';
import { createProduct } from '@/services/products/db/mutations';
import { parseSpecsFromURL } from '@/lib/url-helpers';

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

vi.mock('@/services/products/db/queries', () => ({
  getProducts: vi.fn(),
  getFilteredProducts: vi.fn(),
}));

vi.mock('@/services/products/db/mutations', () => ({
  createProduct: vi.fn(),
}));

vi.mock('@/lib/url-helpers', () => ({
  parseSpecsFromURL: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function createNextRequest(method: string, url: string, body?: any): NextRequest {
  const init: RequestInit = {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  };
  return new NextRequest(url, init as any);
}

describe('API /api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // مقدار پیش‌فرض برای parseSpecsFromURL – آرایه خالی (بدون فیلتر)
    (parseSpecsFromURL as any).mockReturnValue([]);
  });

  describe('GET', () => {
    it('should return all products when no filters', async () => {
      const mockProductsArray = [{ id: 'p1', title: 'Product 1' }];
      (getProducts as any).mockResolvedValue(mockProductsArray);
      (parseSpecsFromURL as any).mockReturnValue([]);
      const req = createNextRequest('GET', 'http://localhost/api/products');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockProductsArray);
      expect(getProducts).toHaveBeenCalled();
      expect(getFilteredProducts).not.toHaveBeenCalled();
    });

    it('should call getFilteredProducts when filters present', async () => {
      const mockFiltered = { items: [{ id: 'p2' }], total: 1, page: 1, pageSize: 10, pages: 1 };
      (getFilteredProducts as any).mockResolvedValue(mockFiltered);
      (parseSpecsFromURL as any).mockReturnValue([{ name: 'color', value: 'red' }]);
      const req = createNextRequest(
        'GET',
        'http://localhost/api/products?brandSlug=nike&minPrice=100'
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      expect(getFilteredProducts).toHaveBeenCalledWith(
        expect.objectContaining({ brandSlug: 'nike', minPrice: 100 })
      );
      const data = await res.json();
      expect(data).toEqual(mockFiltered);
    });

    it('should return 500 on error', async () => {
      (parseSpecsFromURL as any).mockReturnValue([]);
      (getProducts as any).mockRejectedValue(new Error('DB error'));
      const req = createNextRequest('GET', 'http://localhost/api/products');
      const res = await GET(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST', () => {
    const validPayload = {
      title: 'New Product',
      description: 'This is a very long description that exceeds twenty characters easily.',
      price: 1000,
      brandSlug: 'nike',
      categorySlug: 'shoes',
      stockQuantity: 10,
    };
    const createdProduct = { id: 'p1', ...validPayload, slug: 'new-product' };

    it('should return 401 if not authenticated', async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const req = createNextRequest('POST', 'http://localhost/api/products', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 if no permission', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: false });
      const req = createNextRequest('POST', 'http://localhost/api/products', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toBe('Forbidden');
    });

    it('should return 400 on validation error', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      const invalidPayload = { title: '' };
      const req = createNextRequest('POST', 'http://localhost/api/products', invalidPayload);
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should return 201 and created product on success', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (createProduct as any).mockResolvedValue(createdProduct);
      const req = createNextRequest('POST', 'http://localhost/api/products', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual(createdProduct);
      expect(createProduct).toHaveBeenCalledWith(expect.objectContaining(validPayload));
    });

    it('should return 409 on duplicate slug', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      const error = new Error('Product with slug already exists');
      (createProduct as any).mockRejectedValue(error);
      const req = createNextRequest('POST', 'http://localhost/api/products', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toContain('already exists');
    });

    it('should return 500 on other errors', async () => {
      (auth.api.getSession as any).mockResolvedValue({ user: { id: 'u1' } });
      (auth.api.userHasPermission as any).mockResolvedValue({ success: true });
      (createProduct as any).mockRejectedValue(new Error('DB failure'));
      const req = createNextRequest('POST', 'http://localhost/api/products', validPayload);
      const res = await POST(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Internal server error');
    });
  });
});
