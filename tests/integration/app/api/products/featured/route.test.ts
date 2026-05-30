// tests/integration/app/api/products/featured/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/products/featured/route';
import { getFeaturedProducts } from '@/services/products/db/queries';
import { logger } from '@/lib/logger';

vi.mock('@/services/products/db/queries', () => ({
  getFeaturedProducts: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('API /api/products/featured', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return featured products on success', async () => {
    const mockProducts = [
      { id: 'p1', title: 'Featured Product 1' },
      { id: 'p2', title: 'Featured Product 2' },
    ];
    (getFeaturedProducts as any).mockResolvedValue(mockProducts);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockProducts);
    expect(logger.info).toHaveBeenCalledWith(
      'GET /api/products/featured succeeded',
      expect.objectContaining({ count: 2 })
    );
  });

  it('should return empty array if no featured products', async () => {
    (getFeaturedProducts as any).mockResolvedValue([]);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
    expect(logger.info).toHaveBeenCalledWith(
      'GET /api/products/featured succeeded',
      expect.objectContaining({ count: 0 })
    );
  });

  it('should return 500 on error', async () => {
    (getFeaturedProducts as any).mockRejectedValue(new Error('DB error'));
    const res = await GET();
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal server error');
    expect(logger.error).toHaveBeenCalled();
  });
});
