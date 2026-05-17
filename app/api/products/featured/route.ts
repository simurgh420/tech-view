// app/api/products/featured/route.ts
import { NextResponse } from 'next/server';
import { getFeaturedProducts } from '@/services/products/db/queries';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  try {
    const products = await getFeaturedProducts();
    logger.info('GET /api/products/featured succeeded', {
      count: products.length,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(products);
  } catch (error) {
    logger.error('GET /api/products/featured failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
