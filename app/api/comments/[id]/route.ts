//app/api/comments/[id]/route.ts

import { auth } from '@/lib/auth';
import { updateCommentSchema } from '@/lib/validation/comment';
import { deleteComment, updateComment } from '@/services/comments/db/mutations';
import { getCommentById } from '@/services/comments/db/queries';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // احراز هویت
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // دریافت کامنت
    const comment = await getCommentById(id);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    // 🔹 انتخاب action بر اساس مالکیت
    const action = comment.authorId === session.user.id ? 'update:own' : 'update';

    // بررسی مجوز: نویسنده باشد یا ادمینِ دارای دستهٔ update
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { comments: [action] },
      },
    });

    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // اعتبارسنجی بدنه و بروزرسانی

    const body = await req.json();
    const parsed = updateCommentSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const updated = await updateComment(id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update comment failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ۱. احراز هویت
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // ۲. دریافت کامنت

    const comment = await getCommentById(id);
    if (!comment) {
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const result = await deleteComment(id);
    if (result === null) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Delete comment failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
