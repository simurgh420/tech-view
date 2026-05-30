import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/products/brand/[slug]/route';
import { getProductsByBrand } from '@/services/products/db/queries';
import { logger } from '@/lib/logger';

vi.mock('@/services/products/db/queries', () => ({
  getProductsByBrand: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

function createNextRequest(): NextRequest {
  return new NextRequest('http://localhost/api/products/brand/nike', { method: 'GET' } as any);
}

describe('API /api/products/brand/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return products for a valid brand slug', async () => {
    const mockProducts = [
      { id: 'p1', title: 'Product 1' },
      { id: 'p2', title: 'Product 2' },
    ];
    (getProductsByBrand as any).mockResolvedValue(mockProducts);
    const req = createNextRequest();
    const res = await GET(req, { params: Promise.resolve({ slug: 'nike' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockProducts);
    expect(getProductsByBrand).toHaveBeenCalledWith('nike');
    expect(logger.info).toHaveBeenCalledWith(
      'GET /api/products/brand/[slug] succeeded',
      expect.objectContaining({ slug: 'nike', count: 2 })
    );
  });

  it('should return empty array if brand has no products', async () => {
    (getProductsByBrand as any).mockResolvedValue([]);
    const req = createNextRequest();
    const res = await GET(req, { params: Promise.resolve({ slug: 'empty' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
    expect(logger.info).toHaveBeenCalledWith(
      'GET /api/products/brand/[slug] succeeded',
      expect.objectContaining({ slug: 'empty', count: 0 })
    );
  });

  it('should return 500 on error', async () => {
    (getProductsByBrand as any).mockRejectedValue(new Error('DB error'));
    const req = createNextRequest();
    const res = await GET(req, { params: Promise.resolve({ slug: 'test' }) });
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal server error');
    expect(logger.error).toHaveBeenCalled();
  });
});
