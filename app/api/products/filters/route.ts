// app/api/products/filters/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const url = new URL(req.url);
    const categorySlug = url.searchParams.get('categorySlug');
    if (!categorySlug) {
      logger.warn('GET /api/products/filters - Missing categorySlug', {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'categorySlug required' }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: { category: { slug: categorySlug }, status: 'PUBLISHED' },
      select: { specifications: true },
      take: 200,
    });

    const filters: Record<string, Set<string>> = {};

    for (const p of products) {
      const specs = p.specifications as any[];
      if (!specs) continue;
      for (const group of specs) {
        if (group.items) {
          for (const item of group.items) {
            const key = item.label;
            const val = item.value;
            if (!filters[key]) filters[key] = new Set();
            filters[key].add(val);
          }
        }
      }
    }

    const result: Record<string, string[]> = {};
    for (const key in filters) {
      result[key] = Array.from(filters[key]);
    }

    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    logger.info('GET /api/products/filters succeeded', {
      categorySlug,
      filterCount: Object.keys(result).length,
      duration: Date.now() - startTime,
    });
    return response;
  } catch (error) {
    logger.error('GET /api/products/filters failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
