// app/api/reviews/admin/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { deleteReview } from '@/services/reviews/db/mutations';
import { getReviewByIdAdmin } from '@/services/reviews/db/queries';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`GET /api/reviews/admin/${id} - Unauthorized`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permissions: { reviews: ['read'] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn(`GET /api/reviews/admin/${id} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const review = await getReviewByIdAdmin(id);
    if (!review) {
      logger.info(`GET /api/reviews/admin/${id} - Review not found`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    logger.info(`GET /api/reviews/admin/${id} - Success`, { duration: Date.now() - startTime });
    return NextResponse.json(review);
  } catch (error) {
    logger.error(`GET /api/reviews/admin/${id} failed`, {
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
      logger.warn(`DELETE /api/reviews/admin/${id} - Unauthorized`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permissions: { reviews: ['delete'] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn(`DELETE /api/reviews/admin/${id} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existing = await getReviewByIdAdmin(id);
    if (!existing) {
      logger.info(`DELETE /api/reviews/admin/${id} - Review not found`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    await deleteReview(id);
    logger.info(`DELETE /api/reviews/admin/${id} - Deleted`, {
      reviewId: id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`DELETE /api/reviews/admin/${id} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
