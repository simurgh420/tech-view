import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getAdminProducts } from '@/services/products/db/queries';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('GET /api/products/admin - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      logger.warn('GET /api/products/admin - Forbidden', { userId: session.user.id });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const products = await getAdminProducts();
    logger.info('GET /api/products/admin - Success', {
      count: products.length,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(products);
  } catch (error) {
    logger.error('GET /api/products/admin failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
