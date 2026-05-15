//app/api/comments/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { updateCommentSchema } from '@/lib/validation/comment';
import { deleteComment, updateComment } from '@/services/comments/db/mutations';
import { getCommentById } from '@/services/comments/db/queries';
import { logger } from '@/lib/logger';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`PUT /api/comments/${id} - Unauthorized`, { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const comment = await getCommentById(id);
    if (!comment) {
      logger.info(`PUT /api/comments/${id} - Comment not found`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const action = comment.authorId === session.user.id ? 'update:own' : 'update';
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { comments: [action] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn(`PUT /api/comments/${id} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateCommentSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn(`PUT /api/comments/${id} - Validation failed`, {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const updated = await updateComment(id, parsed.data);
    if (!updated) {
      logger.warn(`PUT /api/comments/${id} - Comment not found during update`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    logger.info(`PUT /api/comments/${id} - Updated`, {
      commentId: updated.id,
      userId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(updated);
  } catch (error) {
    logger.error(`PUT /api/comments/${id} failed`, {
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
      logger.warn(`DELETE /api/comments/${id} - Unauthorized`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const comment = await getCommentById(id);
    if (!comment) {
      logger.info(`DELETE /api/comments/${id} - Comment not found`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const action = comment.authorId === session.user.id ? 'delete:own' : 'delete';
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { comments: [action] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn(`DELETE /api/comments/${id} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await deleteComment(id);
    if (result === null) {
      logger.warn(`DELETE /api/comments/${id} - Comment not found during deletion`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    logger.info(`DELETE /api/comments/${id} - Deleted`, {
      commentId: id,
      userId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(result);
  } catch (error) {
    logger.error(`DELETE /api/comments/${id} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
