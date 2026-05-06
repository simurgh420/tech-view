import { auth } from '@/lib/auth';
import { deleteReview } from '@/services/reviews/db/mutations';
import { getReviewByIdAdmin } from '@/services/reviews/db/queries';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
        permission: { reviews: ['read'] },
      },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const review = await getReviewByIdAdmin(id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error(`GET /api/admin/reviews/${id} Error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
        permission: { reviews: ['delete'] },
      },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existing = await getReviewByIdAdmin(id);
    if (!existing) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    await deleteReview(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/admin/reviews/${id} Error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
