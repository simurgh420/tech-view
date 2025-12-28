// app/api/cart/route.ts
import { addCartItem, clearCart } from '@/services/cart/db/mutations';
import { getCartItems } from '@/services/cart/db/queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cartId = url.searchParams.get('cartId');
  if (!cartId) {
    return NextResponse.json({ error: 'cartId is required' }, { status: 400 });
  }
  const items = await getCartItems(cartId);
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  const item = await addCartItem(body);
  return NextResponse.json(item);
}
export async function DELETE(req: Request) {
  const body = await req.json();
  const result = await clearCart(body.cartId);
  return NextResponse.json(result);
}
