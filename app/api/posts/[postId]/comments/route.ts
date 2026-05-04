// app/api/posts/[postId]/comments/route.ts
import { auth } from '@/lib/auth';
import { createCommentSchema } from '@/lib/validation/comment';
import { createComment } from '@/services/comments/db/mutations';
import { getCommentsByPostId } from '@/services/comments/db/queries';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const comments = await getCommentsByPostId(postId);
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    // احراز هویت
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // چک دسترسی ایجاد
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { comments: ['create'] },
      },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { postId } = await params;
    const body = await req.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
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
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
