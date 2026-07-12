// app/api/product-comments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { updateProductCommentSchema } from '@/lib/validation/productComment';
import { deleteComment, updateComment } from '@/services/productComments/db/mutations';
import { getCommentById } from '@/services/productComments/db/queries';
import { logger } from '@/lib/logger';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`PATCH /api/product-comments/${id} - Unauthorized`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const comment = await getCommentById(id);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const action = comment.authorId === session.user.id ? 'update:own' : 'update';
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permissions: { productComments: [action] } },
    });
    if (permission.error || !permission.success) {
      logger.warn(`PATCH /api/product-comments/${id} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateProductCommentSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    // فقط ادمین می‌تونه status رو تغییر بده - بررسی جدا برای امنیت بیشتر
    if (parsed.data.status !== undefined && action !== 'update') {
      const statusPermission = await auth.api.userHasPermission({
        headers: await headers(),
        body: { userId: session.user.id, permissions: { productComments: ['moderate'] } },
      });
      if (statusPermission.error || !statusPermission.success) {
        return NextResponse.json({ error: 'Forbidden: cannot change status' }, { status: 403 });
      }
    }

    const updated = await updateComment(id, parsed.data);
    logger.info(`PATCH /api/product-comments/${id} - Updated`, {
      commentId: updated.id,
      userId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(updated);
  } catch (error) {
    logger.error(`PATCH /api/product-comments/${id} failed`, {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const comment = await getCommentById(id);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const action = comment.authorId === session.user.id ? 'delete:own' : 'delete';
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permissions: { productComments: [action] } },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteComment(id);
    logger.info(`DELETE /api/product-comments/${id} - Deleted`, {
      commentId: id,
      userId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`DELETE /api/product-comments/${id} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
