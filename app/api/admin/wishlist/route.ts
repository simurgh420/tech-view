// app/api/admin/wishlist/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getAllWishlistItems } from '@/services/wishlist/db/queries';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('GET /api/admin/wishlist - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { wishlist: ['read'] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn('GET /api/admin/wishlist - Forbidden', {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const items = await getAllWishlistItems();
    logger.info('GET /api/admin/wishlist succeeded', {
      count: items.length,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(items);
  } catch (error) {
    logger.error('GET /api/admin/wishlist failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
