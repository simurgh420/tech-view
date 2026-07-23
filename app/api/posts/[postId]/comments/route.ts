// app/api/posts/[postId]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { createCommentSchema } from '@/lib/validation/comment';
import { createComment } from '@/services/comments/db/mutations';
import { getCommentsByPostId } from '@/services/comments/db/queries';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const startTime = Date.now();
  try {
    const { postId } = await params;
    const comments = await getCommentsByPostId(postId);
    logger.info(`GET /api/posts/${postId}/comments succeeded`, {
      count: comments.length,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(comments);
  } catch (error) {
    logger.error('GET /api/posts/[postId]/comments failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('POST /api/posts/[postId]/comments - Unauthorized', {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permissions: { comments: ['create'] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn('POST /api/posts/[postId]/comments - Forbidden', {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { postId } = await params;
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) {
      logger.warn(`POST /api/posts/${postId}/comments - Post not found`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn(`POST /api/posts/${postId}/comments - Validation failed`, {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const comment = await createComment({
      postId,
      authorId: session.user.id,
      content: parsed.data.content,
      rating: parsed.data.rating,
    });
    logger.info(`POST /api/posts/${postId}/comments - Comment created`, {
      commentId: comment.id,
      userId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    logger.error('POST /api/posts/[postId]/comments failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
