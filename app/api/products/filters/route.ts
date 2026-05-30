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

    // ✅ کوئری بهینه با GROUP BY روی جدول مشخصات
    const specs = await prisma.productSpecification.groupBy({
      by: ['key', 'value'],
      where: {
        product: {
          category: { slug: categorySlug },
          status: 'PUBLISHED',
        },
      },
      orderBy: { key: 'asc' },
    });

    // تبدیل به فرمت Record<string, string[]>
    const result: Record<string, string[]> = {};
    for (const spec of specs) {
      if (!result[spec.key]) result[spec.key] = [];
      if (!result[spec.key].includes(spec.value)) {
        result[spec.key].push(spec.value);
      }
    }

    // مرتب‌سازی مقادیر هر کلید
    for (const key in result) {
      result[key].sort();
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
