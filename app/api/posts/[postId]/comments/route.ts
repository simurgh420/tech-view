// app/api/posts/[postId]/comments/route.ts
import { createComment } from '@/services/comments/db/mutations';
import { getCommentsByPostId } from '@/services/comments/db/queries';
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
    const { postId } = await params;
    const body = await req.json();
    const comment = await createComment({
      postId,
      authorId: body.authorId,
      content: body.content,
      rating: body.rating,
    });
    return NextResponse.json(comment);
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
