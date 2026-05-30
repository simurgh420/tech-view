import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { addCartItemSchema } from '@/lib/validation/cart';
import { CartErrors } from '@/services/cart/constants';
import { addCartItem, clearCart } from '@/services/cart/db/mutations';
import { getCart } from '@/services/cart/db/queries';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('GET /api/cart - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const items = await getCart(session.user.id);
    logger.info('GET /api/cart succeeded', {
      userId: session.user.id,
      itemCount: items.length,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(items);
  } catch (error) {
    logger.error('GET /api/cart failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('POST /api/cart - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = addCartItemSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn('POST /api/cart - Validation failed', {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const { productId, quantity } = parsed.data;

    try {
      const item = await addCartItem(session.user.id, productId, quantity);
      logger.info('POST /api/cart - Item added', {
        userId: session.user.id,
        productId,
        quantity,
        cartItemId: item.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json(item, { status: 201 });
    } catch (error: any) {
      if (error.message === CartErrors.PRODUCT_NOT_FOUND) {
        logger.warn('POST /api/cart - Product not found', {
          productId,
          duration: Date.now() - startTime,
        });
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      if (
        error.message === CartErrors.INSUFFICIENT_STOCK ||
        error.message === CartErrors.INSUFFICIENT_STOCK_UPDATE
      ) {
        logger.warn('POST /api/cart - Insufficient stock', {
          productId,
          quantity,
          duration: Date.now() - startTime,
        });
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
      }
      // خطای ناشناخته را دوباره پرتاب می‌کنیم تا catch بیرونی بگیرد
      throw error;
    }
  } catch (error) {
    logger.error('POST /api/cart failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('DELETE /api/cart - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await clearCart(session.user.id);
    logger.info('DELETE /api/cart - Cleared', {
      userId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/cart failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
