import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getAdminBlogPosts } from '@/services/blog/db/queries';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('GET /api/blog/admin - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      logger.warn('GET /api/blog/admin - Forbidden', { userId: session.user.id });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const posts = await getAdminBlogPosts();
    logger.info('GET /api/blog/admin - Success', {
      count: posts.length,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(posts);
  } catch (error) {
    logger.error('GET /api/blog/admin failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
