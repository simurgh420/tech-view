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

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json({ error: 'دسته‌بندی پیدا نشد' }, { status: 404 });
    }

    // ✅ لیست attribute های قابل‌فیلتر همین دسته‌بندی، به ترتیب order
    const categoryAttributes = await prisma.categoryAttribute.findMany({
      where: {
        categoryId: category.id,
        isFilterable: true,
      },
      orderBy: { order: 'asc' },
      include: { attribute: true },
    });

    if (categoryAttributes.length === 0) {
      const response = NextResponse.json({});
      response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
      return response;
    }

    const attributeIds = categoryAttributes.map(ca => ca.attributeId);

    // ✅ گروه‌بندی مستقیم روی attributeId - سریع و دقیق، بدون نیاز به نرمال‌سازی runtime
    const specs = await prisma.productSpecification.groupBy({
      by: ['attributeId', 'value'],
      where: {
        attributeId: { in: attributeIds },
        product: {
          category: { slug: categorySlug },
          status: 'PUBLISHED',
        },
      },
    });

    const attributeById = new Map(categoryAttributes.map(ca => [ca.attributeId, ca]));

    const result: Record<string, { label: string; values: string[] }> = {};

    for (const spec of specs) {
      if (!spec.attributeId) continue;

      const ca = attributeById.get(spec.attributeId);
      if (!ca) continue; // احتیاط اضافه (نباید پیش بیاد چون همون attributeIds رو فیلتر کردیم)

      const key = ca.attribute.key;

      if (!result[key]) {
        result[key] = { label: ca.attribute.label, values: [] };
      }
      if (!result[key].values.includes(spec.value)) {
        result[key].values.push(spec.value);
      }
    }

    // مرتب‌سازی کلیدها بر اساس order دسته‌بندی، مقادیر بر اساس الفبا
    const orderByAttrId = new Map(categoryAttributes.map(ca => [ca.attribute.key, ca.order]));
    const sortedResult = Object.fromEntries(
      Object.entries(result)
        .sort(([a], [b]) => (orderByAttrId.get(a) ?? 99) - (orderByAttrId.get(b) ?? 99))
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
