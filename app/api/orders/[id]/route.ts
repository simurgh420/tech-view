// app/api/orders/[id]/route.ts

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getOrderByIdDB } from '@/services/orders/db/queries';
import { cancelOrderDB } from '@/services/orders/db/mutations';

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
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      logger.warn('PATCH /api/orders/[id] - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await cancelOrderDB(id, session.user.id);

    if (!result.success) {
      const message =
        result.reason === 'NOT_FOUND' ? 'سفارش پیدا نشد' : 'این سفارش دیگر قابل لغو نیست';
      const status = result.reason === 'NOT_FOUND' ? 404 : 400;

      logger.warn('PATCH /api/orders/[id] - Cannot cancel', {
        orderId: id,
        userId: session.user.id,
        reason: result.reason,
        duration: Date.now() - startTime,
      });

      return NextResponse.json({ error: message }, { status });
    }

    logger.info('PATCH /api/orders/[id] succeeded', {
      orderId: id,
      userId: session.user.id,
      duration: Date.now() - startTime,
    });

    return NextResponse.json({ order: result.order });
  } catch (err) {
    logger.error('PATCH /api/orders/[id] failed', {
      error: err instanceof Error ? err.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
