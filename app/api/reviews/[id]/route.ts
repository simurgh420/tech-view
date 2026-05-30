// app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { updateReviewSchema } from '@/lib/validation/review';
import { deleteReview, updateReview } from '@/services/reviews/db/mutations';
import { getReviewById } from '@/services/reviews/db/queries';
import { logger } from '@/lib/logger';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`PATCH /api/reviews/${id} - Unauthorized`, { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const review = await getReviewById(id);
    if (!review) {
      logger.info(`PATCH /api/reviews/${id} - Review not found`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const action = review.authorId === session.user.id ? 'update:own' : 'update';
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permission: { reviews: [action] } },
    });
    if (permission.error || !permission.success) {
      logger.warn(`PATCH /api/reviews/${id} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateReviewSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn(`PATCH /api/reviews/${id} - Validation failed`, {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const updated = await updateReview(id, parsed.data);
    logger.info(`PATCH /api/reviews/${id} - Updated`, {
      reviewId: updated.id,
      userId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(updated);
  } catch (error) {
    logger.error(`PATCH /api/reviews/${id} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`DELETE /api/reviews/${id} - Unauthorized`, { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const review = await getReviewById(id);
    if (!review) {
      logger.info(`DELETE /api/reviews/${id} - Review not found`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const action = review.authorId === session.user.id ? 'delete:own' : 'delete';
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permission: { reviews: [action] } },
    });
    if (permission.error || !permission.success) {
      logger.warn(`DELETE /api/reviews/${id} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteReview(id);
    logger.info(`DELETE /api/reviews/${id} - Deleted`, {
      reviewId: id,
      userId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`DELETE /api/reviews/${id} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
