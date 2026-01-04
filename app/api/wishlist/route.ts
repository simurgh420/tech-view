// app/api/wishlist/route.ts
import {
  addToWishlist,
  deleteWishlistItemByUserAndProduct,
} from '@/services/wishlist/db/mutations';
import { getWishlist } from '@/services/wishlist/db/queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }
    const item = await getWishlist(userId);
    return NextResponse.json(item);
  } catch (error) {
    console.error('GET /api/wishlist Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load wishlist' },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item = await addToWishlist(body);
    return NextResponse.json(item);
  } catch (error) {
    console.error('POST /api/wishlist Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const result = await deleteWishlistItemByUserAndProduct(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('DELETE /api/wishlist Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete wishlist item' },
      { status: 500 }
    );
  }
}
