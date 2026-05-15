// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { createReviewSchema } from '@/lib/validation/review';
import { createReview } from '@/services/reviews/db/mutations';
import { getReviewsByProductSlug } from '@/services/reviews/db/queries';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const url = new URL(req.url);
    const product = url.searchParams.get('product');
    if (!product) {
      logger.warn('GET /api/reviews - Missing product slug', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Product slug is required' }, { status: 400 });
    }
    const reviews = await getReviewsByProductSlug(product);
    logger.info('GET /api/reviews succeeded', {
      product,
      count: reviews.length,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(reviews);
  } catch (error) {
    logger.error('GET /api/reviews failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('POST /api/reviews - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permission: { reviews: ['create'] } },
    });
    if (permission.error || !permission.success) {
      logger.warn('POST /api/reviews - Forbidden', {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn('POST /api/reviews - Validation failed', {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const review = await createReview({
      ...parsed.data,
      authorId: session.user.id,
    });

    logger.info('POST /api/reviews - Review created', {
      reviewId: review.id,
      productSlug: parsed.data.productSlug,
      userId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    logger.error('POST /api/reviews failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
