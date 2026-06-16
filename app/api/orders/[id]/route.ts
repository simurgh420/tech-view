// app/api/orders/[id]/route.ts

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getOrderByIdDB } from '@/services/orders/db/queries';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      logger.warn('GET /api/orders/[id] - Unauthorized', {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await getOrderByIdDB(id, session.user.id);

    if (!order) {
      logger.warn('GET /api/orders/[id] - Not found', {
        orderId: id,
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    logger.info('GET /api/orders/[id] succeeded', {
      orderId: id,
      userId: session.user.id,
      duration: Date.now() - startTime,
    });

    return NextResponse.json({ order });
  } catch (err) {
    logger.error('GET /api/orders/[id] failed', {
      error: err instanceof Error ? err.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
