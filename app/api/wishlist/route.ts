// app/api/wishlist/route.ts
import { auth } from '@/lib/auth';
import { wishlistItemSchema } from '@/lib/validation/wishlist';
import {
  addToWishlist,
  deleteWishlistItemByUserAndProduct,
} from '@/services/wishlist/db/mutations';
import { getWishlist } from '@/services/wishlist/db/queries';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// دریافت لیست علاقه‌مندی‌های کاربر جاری
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await getWishlist(session.user.id);
    return NextResponse.json(items);
  } catch (error) {
    console.error('GET /api/wishlist Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// افزودن محصول به علاقه‌مندی‌ها

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permission: { wishlist: ['create'] } },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await req.json();
    const parsed = wishlistItemSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const item = await addToWishlist(session.user.id, parsed.data.productId);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('POST /api/wishlist Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// حذف با productId (کاربر فقط آیتم خودش را حذف می‌کند)
export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = wishlistItemSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }
    await deleteWishlistItemByUserAndProduct(session.user.id, parsed.data.productId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/wishlist Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
