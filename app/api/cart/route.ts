// app/api/cart/route.ts
import { addCartItem, clearCart } from '@/services/cart/db/mutations';
import { getCartItems } from '@/services/cart/db/queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cartId = url.searchParams.get('cartId');
    if (!cartId) {
      return NextResponse.json({ success: false, message: 'cartId is required' }, { status: 400 });
    }
    const items = await getCartItems(cartId);
    return NextResponse.json(items);
  } catch (error) {
    console.error('GET /api/cart Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load cart items' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item = await addCartItem(body);
    return NextResponse.json(item);
  } catch (error) {
    console.error('POST /api/cart Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const result = await clearCart(body.cartId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('DELETE /api/cart Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to clear cart' }, { status: 500 });
  }
}
