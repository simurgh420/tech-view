import { auth } from '@/lib/auth';
import { getAllWishlistItems } from '@/services/wishlist/db/queries'; // باید اضافه شود
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    // 1. Auth
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. دریافت داده‌ها
    const items = await getAllWishlistItems(); 
    return NextResponse.json(items);
  } catch (error) {
    console.error('GET /api/admin/wishlist Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
