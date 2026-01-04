// app/api/cart/[id]/route.ts

import { removeCartItem, updateCartItemQuantity } from '@/services/cart/db/mutations';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const item = await updateCartItemQuantity(id, body.quantity);
    return NextResponse.json(item);
  } catch (error) {
    console.error(`PATCH /api/cart/${id} Error:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await removeCartItem(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`DELETE /api/cart/${id} Error:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete cart item' },
      { status: 500 }
    );
  }
}
