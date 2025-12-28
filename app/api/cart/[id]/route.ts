// app/api/cart/[id]/route.ts

import { removeCartItem, updateCartItemQuantity } from '@/services/cart/db/mutations';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const item = await updateCartItemQuantity(id, body.quantity);
  return NextResponse.json(item);
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await removeCartItem(id);
  return NextResponse.json(result);
}
