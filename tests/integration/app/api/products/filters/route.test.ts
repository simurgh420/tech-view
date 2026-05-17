// tests/integration/app/api/products/filters/route.test.ts
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
    productSpecification: {
      groupBy: vi.fn(),
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
    const mockSpecs = [
      { key: 'color', value: 'red' },
      { key: 'color', value: 'blue' },
      { key: 'ram', value: '8GB' },
    ];
    (prisma.productSpecification.groupBy as any).mockResolvedValue(mockSpecs);
    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=electronics');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({
      color: ['blue', 'red'], // مرتب شده
      ram: ['8GB'],
    });
    expect(prisma.productSpecification.groupBy).toHaveBeenCalledWith({
      by: ['key', 'value'],
      where: {
        product: {
          category: { slug: 'electronics' },
          status: 'PUBLISHED',
        },
      },
      orderBy: { key: 'asc' },
    });
    expect(logger.info).toHaveBeenCalled();
  });

  it('should handle empty products array', async () => {
    (prisma.productSpecification.groupBy as any).mockResolvedValue([]);
    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=empty');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({});
  });

  it('should handle products with no specifications', async () => {
    (prisma.productSpecification.groupBy as any).mockResolvedValue([]);
    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=test');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({});
  });

  it('should return 500 on database error', async () => {
    (prisma.productSpecification.groupBy as any).mockRejectedValue(new Error('DB error'));
    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=test');
    const res = await GET(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal server error');
    expect(logger.error).toHaveBeenCalled();
  });
});
