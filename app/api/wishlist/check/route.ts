// app/api/wishlist/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { isProductInWishlist } from '@/services/wishlist/db/queries';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('GET /api/wishlist/check - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // بررسی مجوز خواندن وضعیت wishlist
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permissions: { wishlist: ['read'] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn('GET /api/wishlist/check - Forbidden', {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    if (!productId) {
      logger.warn('GET /api/wishlist/check - Missing productId', {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const inWishlist = await isProductInWishlist(session.user.id, productId);
    logger.info('GET /api/wishlist/check succeeded', {
      userId: session.user.id,
      productId,
      inWishlist,
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ inWishlist });
  } catch (error) {
    logger.error('GET /api/wishlist/check failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
