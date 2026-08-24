import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';
import { normalizeRawKey } from '@/lib/normalizeFilterKey';
import { normalizeFilterValue } from '@/lib/normalizeFilterValue';
import { ALLOWED_FILTER_KEYS, RAW_KEY_ALIASES, VALUE_ALIASES } from '@/config/roductFilters';

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

    // ⚠️ چون کلیدهای خام غیرقابل‌پیش‌بینی‌ان (ایموجی، دونقطه، ...)
    // دیگه در سطح دیتابیس با key فیلتر نمی‌کنیم؛ همه‌ی specs همون
    // دسته رو می‌گیریم و نرمال‌سازی/فیلتر رو در جاوااسکریپت انجام می‌دیم.
    const specs = await prisma.productSpecification.groupBy({
      by: ['key', 'value'],
      where: {
        product: {
          category: { slug: categorySlug },
          status: 'PUBLISHED',
        },
      },
    });

    const result: Record<string, { label: string; values: string[] }> = {};
    const unmatchedKeys = new Set<string>();

    for (const spec of specs) {
      const normalizedKey = normalizeRawKey(spec.key);
      const canonicalKey = RAW_KEY_ALIASES[normalizedKey];

      if (!canonicalKey) {
        unmatchedKeys.add(spec.key);
        continue;
      }

      const cfg = ALLOWED_FILTER_KEYS[canonicalKey];
      if (!cfg || !cfg.enabled) continue;

      const normalizedValue = normalizeFilterValue(canonicalKey, spec.value, VALUE_ALIASES);

      if (!result[canonicalKey]) {
        result[canonicalKey] = { label: cfg.label, values: [] };
      }
      if (!result[canonicalKey].values.includes(normalizedValue)) {
        result[canonicalKey].values.push(normalizedValue);
      }
    }

    // کلیدهای ناشناخته رو لاگ کن تا بعداً به RAW_KEY_ALIASES اضافه‌شون کنید
    if (unmatchedKeys.size > 0) {
      logger.warn('GET /api/products/filters - Unmatched spec keys', {
        categorySlug,
        unmatchedKeys: Array.from(unmatchedKeys),
      });
    }

    const sortedResult = Object.fromEntries(
      Object.entries(result)
        .sort(
          ([a], [b]) => (ALLOWED_FILTER_KEYS[a].order ?? 99) - (ALLOWED_FILTER_KEYS[b].order ?? 99)
        )
        .map(([key, val]) => [key, { ...val, values: val.values.sort() }])
    );

    const response = NextResponse.json(sortedResult);
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    logger.info('GET /api/products/filters succeeded', {
      categorySlug,
      filterCount: Object.keys(sortedResult).length,
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
