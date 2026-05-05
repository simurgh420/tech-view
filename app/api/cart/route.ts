// app/api/cart/route.ts
import { auth } from '@/lib/auth';
import { addCartItemSchema } from '@/lib/validation/cart';
import { CartErrors } from '@/services/cart/constants';
import { addCartItem, clearCart } from '@/services/cart/db/mutations';
import { getCart } from '@/services/cart/db/queries';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const items = await getCart(session.user.id);
    return NextResponse.json(items);
  } catch (error) {
    console.error('GET /api/cart Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. احراز هویت
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. اعتبارسنجی بدنه درخواست
    const body = await req.json();
    const parsed = addCartItemSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const { productId, quantity } = parsed.data;

    try {
      const item = await addCartItem(session.user.id, productId, quantity);
      return NextResponse.json(item, { status: 201 });
    } catch (error: any) {
      if (error.message === CartErrors.PRODUCT_NOT_FOUND) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      if (
        error.message === CartErrors.INSUFFICIENT_STOCK ||
        error.message === CartErrors.INSUFFICIENT_STOCK_UPDATE
      ) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
      }
      // خطاهای پیش‌بینی‌نشده را به catch بیرونی پرتاب کن
      throw error;
    }
  } catch (error) {
    console.error('POST /api/cart Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await clearCart(session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/cart Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
