// app/api/wishlist/[id]/route.ts
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
      logger.warn(`DELETE /api/wishlist/${id} - Unauthorized`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ابتدا آیتم را واکشی می‌کنیم تا مالکیت مشخص شود
    const item = await getWishlistItemById(id);
    if (!item) {
      logger.info(`DELETE /api/wishlist/${id} - Item not found`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
    }

    // انتخاب نوع مجوز بر اساس مالکیت
    const action = item.userId === session.user.id ? 'delete:own' : 'delete';

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permissions: { wishlist: [action] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn(`DELETE /api/wishlist/${id} - Forbidden`, {
        userId: session.user.id,
        requiredPermission: action,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // حذف آیتم
    await removeFromWishlist(id);
    logger.info(`DELETE /api/wishlist/${id} - Removed`, {
      userId: session.user.id,
      itemId: id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`DELETE /api/wishlist/${id} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
