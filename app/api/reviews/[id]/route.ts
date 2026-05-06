// app/api/reviews/[id]/route.ts

import { auth } from '@/lib/auth';
import { updateReviewSchema } from '@/lib/validation/review';
import { deleteReview, updateReview } from '@/services/reviews/db/mutations';
import { getReviewById } from '@/services/reviews/db/queries';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const review = await getReviewById(id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    const action = review.authorId === session.user.id ? 'update:own' : 'update';
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permission: { reviews: [action] } },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateReviewSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }
    const updated = await updateReview(id, parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/reviews/[id] Error:', error);
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
    const review = await getReviewById(id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    const action = review.authorId === session.user.id ? 'delete:own' : 'delete';
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permission: { reviews: [action] } },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await deleteReview(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/reviews/[id] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
