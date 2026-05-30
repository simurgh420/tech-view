import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { createBlogPayloadSchema, createBlogSchema } from '@/lib/validation/blog';
import { createBlogPost } from '@/services/blog/db/mutations';
import { getPublishedPosts } from '@/services/blog/db/queries';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('pageSize') ?? '10', 10) || 10)
    );

    const blogs = await getPublishedPosts({ page, pageSize });
    logger.info('GET /api/blog succeeded', {
      page,
      pageSize,
      count: blogs.items.length,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(blogs);
  } catch (error) {
    logger.error('GET /api/blog failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Failed to fetch published posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('POST /api/blog - Unauthorized attempt', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { posts: ['create'] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn('POST /api/blog - Forbidden', {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createBlogPayloadSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn('POST /api/blog - Validation failed', {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const payload = createBlogSchema.parse({
      ...parsed.data,
      authorId: session.user.id,
    });

    const blog = await createBlogPost(payload);
    logger.info('POST /api/blog - Blog created', {
      blogId: blog.id,
      authorId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    logger.error('POST /api/blog failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
