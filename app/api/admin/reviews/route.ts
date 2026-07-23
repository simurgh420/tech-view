//app/api/admin/reviews/route.ts

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getAllReviewsAdmin } from '@/services/reviews/db/queries';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('GET /api/admin/reviews - Unauthorized', { duration: Date.now() - startTime });
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
      logger.warn('GET /api/admin/reviews - Forbidden', {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reviews = await getAllReviewsAdmin();
    logger.info('GET /api/admin/reviews succeeded', {
      count: reviews.length,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(reviews);
  } catch (error) {
    logger.error('GET /api/admin/reviews failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
