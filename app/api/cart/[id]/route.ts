import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { updateQuantitySchema } from '@/lib/validation/cart';
import { CartErrors } from '@/services/cart/constants';
import { removeCartItem, updateCartItemQuantity } from '@/services/cart/db/mutations';
import { logger } from '@/lib/logger';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`PATCH /api/cart/${id} - Unauthorized`, { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateQuantitySchema.safeParse(body);
    if (!parsed.success) {
      logger.warn(`PATCH /api/cart/${id} - Validation failed`, {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    try {
      const result = await updateCartItemQuantity(id, session.user.id, parsed.data.quantity);
      if (result === null) {
        logger.warn(`PATCH /api/cart/${id} - Cart item not found`, {
          userId: session.user.id,
          duration: Date.now() - startTime,
        });
        return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
      }
      if (result === 'forbidden') {
        logger.warn(`PATCH /api/cart/${id} - Forbidden`, {
          userId: session.user.id,
          duration: Date.now() - startTime,
        });
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      logger.info(`PATCH /api/cart/${id} - Quantity updated`, {
        userId: session.user.id,
        newQuantity: parsed.data.quantity,
        duration: Date.now() - startTime,
      });
      return NextResponse.json(result);
    } catch (error: any) {
      if (error.message === CartErrors.INSUFFICIENT_STOCK) {
        logger.warn(`PATCH /api/cart/${id} - Insufficient stock`, {
          userId: session.user.id,
          quantity: parsed.data.quantity,
          duration: Date.now() - startTime,
        });
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    logger.error(`PATCH /api/cart/${id} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`DELETE /api/cart/${id} - Unauthorized`, { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await removeCartItem(id, session.user.id);
    if (result === null) {
      logger.warn(`DELETE /api/cart/${id} - Cart item not found`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }
    if (result === 'forbidden') {
      logger.warn(`DELETE /api/cart/${id} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    logger.info(`DELETE /api/cart/${id} - Item removed`, {
      userId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`DELETE /api/cart/${id} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
