import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/products/filters/route';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => ({
  default: {
    product: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function createNextRequest(url: string): NextRequest {
  return new NextRequest(url, { method: 'GET' } as any);
}

describe('API /api/products/filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if categorySlug is missing', async () => {
    const req = createNextRequest('http://localhost/api/products/filters');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('categorySlug required');
    expect(logger.warn).toHaveBeenCalled();
  });

  it('should return 200 and extracted filters on success', async () => {
    const mockProducts = [
      {
        specifications: [
          {
            group: 'گروه 1',
            items: [
              { label: 'رنگ', value: 'قرمز' },
              { label: 'رنگ', value: 'آبی' },
              { label: 'حافظه', value: '256GB' },
            ],
          },
          {
            group: 'گروه 2',
            items: [
              { label: 'پردازنده', value: 'Intel' },
              { label: 'حافظه', value: '512GB' },
            ],
          },
        ],
      },
      {
        specifications: [
          {
            group: 'گروه 1',
            items: [{ label: 'رنگ', value: 'سبز' }],
          },
        ],
      },
    ];
    (prisma.product.findMany as any).mockResolvedValue(mockProducts);
    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=electronics');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({
      رنگ: ['قرمز', 'آبی', 'سبز'],
      حافظه: ['256GB', '512GB'],
      پردازنده: ['Intel'],
    });
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { category: { slug: 'electronics' }, status: 'PUBLISHED' },
      select: { specifications: true },
      take: 200,
    });
    expect(logger.info).toHaveBeenCalled();
    // بررسی هدر کش
    expect(res.headers.get('Cache-Control')).toBe(
      'public, s-maxage=3600, stale-while-revalidate=600'
    );
  });

  it('should handle empty products array', async () => {
    (prisma.product.findMany as any).mockResolvedValue([]);
    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=empty');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({});
  });

  it('should handle products with no specifications', async () => {
    const mockProducts = [{ specifications: null }, { specifications: [] }];
    (prisma.product.findMany as any).mockResolvedValue(mockProducts);
    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=test');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({});
  });

  it('should return 500 on database error', async () => {
    (prisma.product.findMany as any).mockRejectedValue(new Error('DB error'));
    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=test');
    const res = await GET(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal server error');
    expect(logger.error).toHaveBeenCalled();
  });
});
