import { auth } from '@/lib/auth';
import { removeFromWishlist } from '@/services/wishlist/db/mutations';
import { getWishlistItemById } from '@/services/wishlist/db/queries';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existing = await getWishlistItemById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
    }

    await removeFromWishlist(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/admin/wishlist/${id} Error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
