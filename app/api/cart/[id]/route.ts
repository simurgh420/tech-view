// app/api/cart/[id]/route.ts

import { auth } from '@/lib/auth';
import { updateQuantitySchema } from '@/lib/validation/cart';
import { CartErrors } from '@/services/cart/constants';
import { removeCartItem, updateCartItemQuantity } from '@/services/cart/db/mutations';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const parsed = updateQuantitySchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }
    try {
      const result = await updateCartItemQuantity(id, session.user.id, parsed.data.quantity);
      if (result === null) {
        return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
      }
      if (result === 'forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.json(result);
    } catch (error: any) {
      if (error.message === CartErrors.INSUFFICIENT_STOCK) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('PATCH /api/cart/[id] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await removeCartItem(id, session.user.id);
    if (result === null) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }
    if (result === 'forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/cart/[id] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
