import { auth } from '@/lib/auth';
import { isProductInWishlist } from '@/services/wishlist/db/queries';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const inWishlist = await isProductInWishlist(session.user.id, productId);
    return NextResponse.json({ inWishlist });
  } catch (error) {
    console.error('GET /api/wishlist/check Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
