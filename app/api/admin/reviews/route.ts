import { auth } from '@/lib/auth';
import { getAllReviewsAdmin } from '@/services/reviews/db/queries';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    // 1. احراز هویت
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. بررسی دسترسی ادمین (read)
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { reviews: ['read'] },
      },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reviews = await getAllReviewsAdmin();
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('GET /api/admin/reviews Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
