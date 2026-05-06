import { auth } from '@/lib/auth';
import { clearWishlist } from '@/services/wishlist/db/mutations';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function DELETE(req: Request) {
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

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await clearWishlist(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/wishlist/clear Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
