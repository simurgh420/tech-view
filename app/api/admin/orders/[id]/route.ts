// app/api/admin/orders/[id]/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getAdminOrderByIdDB, updateOrderStatusDB } from '@/services/orders/db/queries';
import { OrderStatus } from '@/app/generated/prisma/enums';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(OrderStatus),
});

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return null;
  }
  return session;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;

  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await getAdminOrderByIdDB(id);
    if (!order) {
      logger.warn('GET /api/admin/orders/[id] - Not found', {
        orderId: id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    logger.info('GET /api/admin/orders/[id] succeeded', {
      orderId: id,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(order);
  } catch (err) {
    logger.error('GET /api/admin/orders/[id] failed', {
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
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'وضعیت نامعتبر است' }, { status: 400 });
    }

    const order = await updateOrderStatusDB(id, parsed.data.status);

    logger.info('PATCH /api/admin/orders/[id] succeeded', {
      orderId: id,
      status: parsed.data.status,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(order);
  } catch (err) {
    logger.error('PATCH /api/admin/orders/[id] failed', {
      error: err instanceof Error ? err.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
