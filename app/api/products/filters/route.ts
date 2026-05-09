import prisma from '@/services/db/client';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const categorySlug = url.searchParams.get('categorySlug');
  if (!categorySlug) {
    return NextResponse.json({ error: 'categorySlug required' }, { status: 400 });
  }

  try {
    // دریافت محصولات این دسته (فقط specifications)
    const products = await prisma.product.findMany({
      where: { category: { slug: categorySlug }, status: 'PUBLISHED' },
      select: { specifications: true },
      take: 200, // محدودیت برای پرفورمنس
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

    // اضافه کردن هدر کش برای بهبود پرفورمنس
    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('GET /api/products/filters Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
