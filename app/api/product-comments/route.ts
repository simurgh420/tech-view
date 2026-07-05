// app/api/product-comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { createProductCommentSchema } from '@/lib/validation/productComment';
import { createComment } from '@/services/productComments/db/mutations';
import { getCommentsByProductSlug } from '@/services/productComments/db/queries';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const url = new URL(req.url);
    const product = url.searchParams.get('product');
    if (!product) {
      logger.warn('GET /api/product-comments - Missing product slug', {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Product slug is required' }, { status: 400 });
    }
    const comments = await getCommentsByProductSlug(product);
    logger.info('GET /api/product-comments succeeded', {
      product,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(comments);
  } catch (error) {
    logger.error('GET /api/product-comments failed', {
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
      logger.warn('POST /api/product-comments - Unauthorized', {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permission: { productComments: ['create'] } },
    });
    if (permission.error || !permission.success) {
      logger.warn('POST /api/product-comments - Forbidden', {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createProductCommentSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      logger.warn('POST /api/product-comments - Validation failed', {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const comment = await createComment({
      ...parsed.data,
      authorId: session.user.id,
    });

    logger.info('POST /api/product-comments - Comment created', {
      commentId: comment.id,
      userId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    logger.error('POST /api/product-comments failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    if (error.message === 'MAX_DEPTH_REACHED') {
      return NextResponse.json(
        { error: 'حداکثر عمق پاسخ‌دهی به این دیدگاه رسیده است' },
        { status: 400 }
      );
    }
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
