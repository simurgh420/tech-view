import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/products/category/[slug]/route';
import { getProductsByCategory } from '@/services/products/db/queries';
import { logger } from '@/lib/logger';

vi.mock('@/services/products/db/queries', () => ({
  getProductsByCategory: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

function createNextRequest(): NextRequest {
  return new NextRequest('http://localhost/api/products/category/electronics', {
    method: 'GET',
  } as any);
}

describe('API /api/products/category/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return products for a valid category slug', async () => {
    const mockProducts = [
      { id: 'p1', title: 'Product 1' },
      { id: 'p2', title: 'Product 2' },
    ];
    (getProductsByCategory as any).mockResolvedValue(mockProducts);
    const req = createNextRequest();
    const res = await GET(req, { params: Promise.resolve({ slug: 'electronics' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockProducts);
    expect(getProductsByCategory).toHaveBeenCalledWith('electronics');
    expect(logger.info).toHaveBeenCalledWith(
      'GET /api/products/category/[slug] succeeded',
      expect.objectContaining({ slug: 'electronics', count: 2 })
    );
  });

  it('should return empty array if category has no products', async () => {
    (getProductsByCategory as any).mockResolvedValue([]);
    const req = createNextRequest();
    const res = await GET(req, { params: Promise.resolve({ slug: 'empty' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
    expect(logger.info).toHaveBeenCalledWith(
      'GET /api/products/category/[slug] succeeded',
      expect.objectContaining({ slug: 'empty', count: 0 })
    );
  });

  it('should return 500 on error', async () => {
    (getProductsByCategory as any).mockRejectedValue(new Error('DB error'));
    const req = createNextRequest();
    const res = await GET(req, { params: Promise.resolve({ slug: 'test' }) });
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal server error');
    expect(logger.error).toHaveBeenCalled();
  });
});
