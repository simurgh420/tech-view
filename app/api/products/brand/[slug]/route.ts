// app/api/products/brand/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProductsByBrand } from '@/services/products/db/queries';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const startTime = Date.now();
  const { slug } = await params;
  try {
    const products = await getProductsByBrand(slug);
    logger.info('GET /api/products/brand/[slug] succeeded', {
      slug,
      count: products.length,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(products);
  } catch (error) {
    logger.error('GET /api/products/brand/[slug] failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
