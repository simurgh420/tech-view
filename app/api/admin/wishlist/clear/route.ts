// app/api/admin/wishlist/clear/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { clearWishlist } from '@/services/wishlist/db/mutations';
import { logger } from '@/lib/logger';

export async function DELETE(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('DELETE /api/admin/wishlist/clear - Unauthorized', {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { wishlist: ['delete'] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn('DELETE /api/admin/wishlist/clear - Forbidden', {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      logger.warn('DELETE /api/admin/wishlist/clear - Missing userId', {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await clearWishlist(userId);
    logger.info('DELETE /api/admin/wishlist/clear - Cleared', {
      userId,
      adminId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/admin/wishlist/clear failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
