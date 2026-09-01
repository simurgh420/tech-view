// app/api/admin/orders/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getAdminOrdersDB } from '@/services/orders/db/queries';

export async function GET() {
  const startTime = Date.now();

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      logger.warn('GET /api/admin/orders - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await getAdminOrdersDB();

    logger.info('GET /api/admin/orders succeeded', {
      count: orders.length,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(orders);
  } catch (err) {
    logger.error('GET /api/admin/orders failed', {
      error: err instanceof Error ? err.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
