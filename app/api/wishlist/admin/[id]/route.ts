// app/api/wishlist/admin/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { removeFromWishlist } from '@/services/wishlist/db/mutations';
import { getWishlistItemById } from '@/services/wishlist/db/queries';
import { logger } from '@/lib/logger';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`DELETE /api/wishlist/admin/${id} - Unauthorized`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permissions: { wishlist: ['delete'] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn(`DELETE /api/wishlist/admin/${id} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existing = await getWishlistItemById(id);
    if (!existing) {
      logger.info(`DELETE /api/wishlist/admin/${id} - Item not found`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
    }

    await removeFromWishlist(id);
    logger.info(`DELETE /api/wishlist/admin/${id} - Removed`, {
      adminId: session.user.id,
      itemId: id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`DELETE /api/wishlist/admin/${id} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
