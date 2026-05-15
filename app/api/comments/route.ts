import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getAllCommentsWithPost } from '@/services/comments/db/queries';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('GET /api/admin/comments - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { comments: ['read'] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn('GET /api/admin/comments - Forbidden', {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const comments = await getAllCommentsWithPost();
    logger.info('GET /api/admin/comments succeeded', {
      count: comments.length,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(comments);
  } catch (error) {
    logger.error('GET /api/admin/comments failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
