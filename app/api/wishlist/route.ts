// app/api/wishlist/route.ts
import {
  addToWishlist,
  removeFromWishlistByUserAndProduct,
} from '@/services/wishlist/db/mutations';
import { getWishlistByUserId } from '@/services/wishlist/db/queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }
  const item = await getWishlistByUserId(userId);
  return NextResponse.json(item);
}
export async function POST(req: Request) {
  const body = await req.json();
  const item = await addToWishlist(body);
  return NextResponse.json(item);
}
// DELETE با body: { userId, productId } برای toggle API

export async function DELETE(req: Request) {
  const body = await req.json();
  const result = await removeFromWishlistByUserAndProduct(body.userId, body.productId);
  return NextResponse.json(result);
}
