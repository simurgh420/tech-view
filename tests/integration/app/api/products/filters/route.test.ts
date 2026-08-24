// tests/integration/app/api/products/filters/route.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { GET } from '@/app/api/products/filters/route';

import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => ({
  default: {
    category: {
      findUnique: vi.fn(),
    },

    categoryAttribute: {
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
  return new NextRequest(url, {
    method: 'GET',
  });
}

describe('API /api/products/filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (prisma.category.findUnique as any).mockResolvedValue({
      id: 'category-1',
    });

    (prisma.categoryAttribute.findMany as any).mockResolvedValue([]);

    (prisma.productSpecification.groupBy as any).mockResolvedValue([]);
  });

  it('should return 400 if categorySlug is missing', async () => {
    const req = createNextRequest('http://localhost/api/products/filters');

    const res = await GET(req);

    expect(res.status).toBe(400);

    const data = await res.json();

    expect(data.error).toBe('categorySlug required');
    expect(logger.warn).toHaveBeenCalled();
  });

  it('should return 404 if category does not exist', async () => {
    (prisma.category.findUnique as any).mockResolvedValue(null);

    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=unknown');

    const res = await GET(req);

    expect(res.status).toBe(404);

    const data = await res.json();

    expect(data.error).toBe('دسته‌بندی پیدا نشد');
  });

  it('should return empty object when category has no filterable attributes', async () => {
    (prisma.category.findUnique as any).mockResolvedValue({
      id: 'category-1',
    });

    (prisma.categoryAttribute.findMany as any).mockResolvedValue([]);

    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=electronics');

    const res = await GET(req);

    expect(res.status).toBe(200);

    const data = await res.json();

    expect(data).toEqual({});

    expect(prisma.productSpecification.groupBy).not.toHaveBeenCalled();
  });

  it('should return 200 and extracted filters on success', async () => {
    const categoryAttributes = [
      {
        categoryId: 'category-1',
        attributeId: 'attribute-color',
        isFilterable: true,
        order: 1,
        attribute: {
          id: 'attribute-color',
          key: 'color',
          label: 'رنگ',
        },
      },
      {
        categoryId: 'category-1',
        attributeId: 'attribute-ram',
        isFilterable: true,
        order: 2,
        attribute: {
          id: 'attribute-ram',
          key: 'ram',
          label: 'رم',
        },
      },
    ];

    const mockSpecs = [
      {
        attributeId: 'attribute-color',
        value: 'red',
      },
      {
        attributeId: 'attribute-color',
        value: 'blue',
      },
      {
        attributeId: 'attribute-ram',
        value: '8GB',
      },
    ];

    (prisma.category.findUnique as any).mockResolvedValue({
      id: 'category-1',
    });

    (prisma.categoryAttribute.findMany as any).mockResolvedValue(categoryAttributes);

    (prisma.productSpecification.groupBy as any).mockResolvedValue(mockSpecs);

    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=electronics');

    const res = await GET(req);

    expect(res.status).toBe(200);

    const data = await res.json();

    expect(data).toEqual({
      color: {
        label: 'رنگ',
        values: ['blue', 'red'],
      },
      ram: {
        label: 'رم',
        values: ['8GB'],
      },
    });

    expect(prisma.category.findUnique).toHaveBeenCalledWith({
      where: {
        slug: 'electronics',
      },
      select: {
        id: true,
      },
    });

    expect(prisma.categoryAttribute.findMany).toHaveBeenCalledWith({
      where: {
        categoryId: 'category-1',
        isFilterable: true,
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        attribute: true,
      },
    });

    expect(prisma.productSpecification.groupBy).toHaveBeenCalledWith({
      by: ['attributeId', 'value'],
      where: {
        attributeId: {
          in: ['attribute-color', 'attribute-ram'],
        },
        product: {
          category: {
            slug: 'electronics',
          },
          status: 'PUBLISHED',
        },
      },
    });

    expect(logger.info).toHaveBeenCalled();
  });

  it('should sort attributes by category order', async () => {
    const categoryAttributes = [
      {
        categoryId: 'category-1',
        attributeId: 'attribute-ram',
        isFilterable: true,
        order: 2,
        attribute: {
          id: 'attribute-ram',
          key: 'ram',
          label: 'رم',
        },
      },
      {
        categoryId: 'category-1',
        attributeId: 'attribute-color',
        isFilterable: true,
        order: 1,
        attribute: {
          id: 'attribute-color',
          key: 'color',
          label: 'رنگ',
        },
      },
    ];

    const mockSpecs = [
      {
        attributeId: 'attribute-ram',
        value: '8GB',
      },
      {
        attributeId: 'attribute-color',
        value: 'red',
      },
    ];

    (prisma.categoryAttribute.findMany as any).mockResolvedValue(categoryAttributes);

    (prisma.productSpecification.groupBy as any).mockResolvedValue(mockSpecs);

    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=electronics');

    const res = await GET(req);

    expect(res.status).toBe(200);

    const data = await res.json();

    expect(Object.keys(data)).toEqual(['color', 'ram']);
  });

  it('should sort filter values alphabetically', async () => {
    const categoryAttributes = [
      {
        categoryId: 'category-1',
        attributeId: 'attribute-color',
        isFilterable: true,
        order: 1,
        attribute: {
          id: 'attribute-color',
          key: 'color',
          label: 'رنگ',
        },
      },
    ];

    const mockSpecs = [
      {
        attributeId: 'attribute-color',
        value: 'red',
      },
      {
        attributeId: 'attribute-color',
        value: 'black',
      },
      {
        attributeId: 'attribute-color',
        value: 'blue',
      },
    ];

    (prisma.categoryAttribute.findMany as any).mockResolvedValue(categoryAttributes);

    (prisma.productSpecification.groupBy as any).mockResolvedValue(mockSpecs);

    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=electronics');

    const res = await GET(req);

    expect(res.status).toBe(200);

    const data = await res.json();

    expect(data).toEqual({
      color: {
        label: 'رنگ',
        values: ['black', 'blue', 'red'],
      },
    });
  });

  it('should ignore specifications without attributeId', async () => {
    const categoryAttributes = [
      {
        categoryId: 'category-1',
        attributeId: 'attribute-color',
        isFilterable: true,
        order: 1,
        attribute: {
          id: 'attribute-color',
          key: 'color',
          label: 'رنگ',
        },
      },
    ];

    const mockSpecs = [
      {
        attributeId: null,
        value: 'red',
      },
      {
        attributeId: 'attribute-color',
        value: 'blue',
      },
    ];

    (prisma.categoryAttribute.findMany as any).mockResolvedValue(categoryAttributes);

    (prisma.productSpecification.groupBy as any).mockResolvedValue(mockSpecs);

    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=electronics');

    const res = await GET(req);

    expect(res.status).toBe(200);

    const data = await res.json();

    expect(data).toEqual({
      color: {
        label: 'رنگ',
        values: ['blue'],
      },
    });
  });

  it('should return empty object when specifications are empty', async () => {
    const categoryAttributes = [
      {
        categoryId: 'category-1',
        attributeId: 'attribute-color',
        isFilterable: true,
        order: 1,
        attribute: {
          id: 'attribute-color',
          key: 'color',
          label: 'رنگ',
        },
      },
    ];

    (prisma.categoryAttribute.findMany as any).mockResolvedValue(categoryAttributes);

    (prisma.productSpecification.groupBy as any).mockResolvedValue([]);

    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=electronics');

    const res = await GET(req);

    expect(res.status).toBe(200);

    const data = await res.json();

    expect(data).toEqual({});
  });

  it('should return 500 on database error', async () => {
    (prisma.category.findUnique as any).mockRejectedValue(new Error('DB error'));

    const req = createNextRequest('http://localhost/api/products/filters?categorySlug=test');

    const res = await GET(req);

    expect(res.status).toBe(500);

    const data = await res.json();

    expect(data.error).toBe('Internal server error');
    expect(logger.error).toHaveBeenCalled();
  });
});
