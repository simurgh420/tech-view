// app/api/orders/route.ts

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

import { checkoutSchema } from '@/lib/validation/checkout';
import { createOrderDB } from '@/services/orders/db/mutations';
import { getUserOrdersDB } from '@/services/orders/db/queries';
import { getCartForCheckout } from '@/services/cart/db/queries';

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      logger.warn('POST /api/orders - Unauthorized', {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn('POST /api/orders - Validation failed', {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      return NextResponse.json(parsed.error.format(), { status: 400 });
    }

    const cart = await getCartForCheckout(session.user.id);

    if (!cart || cart.items.length === 0) {
      logger.warn('POST /api/orders - Cart empty', {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const items = cart.items.map(item => ({
      productId: item.product.id,
      title: item.product.title,
      price: Number(item.product.discountPrice ?? item.product.price),
      quantity: item.quantity,
    }));

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await createOrderDB(session.user.id, {
      items,
      total,
      address: parsed.data,
    });

    logger.info('POST /api/orders - Order created', {
      userId: session.user.id,
      orderId: order.id,
      duration: Date.now() - startTime,
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err) {
    logger.error('POST /api/orders failed', {
      error: err instanceof Error ? err.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  const startTime = Date.now();

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      logger.warn('GET /api/orders - Unauthorized', {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await getUserOrdersDB(session.user.id);

    logger.info('GET /api/orders succeeded', {
      userId: session.user.id,
      count: orders.length,
      duration: Date.now() - startTime,
    });

    return NextResponse.json({ orders });
  } catch (err) {
    logger.error('GET /api/orders failed', {
      error: err instanceof Error ? err.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
