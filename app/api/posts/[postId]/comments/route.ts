import { createComment } from '@/services/comments/db/mutations';
import { getCommentsByPostId } from '@/services/comments/db/queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const comments = await getCommentsByPostId(postId);
  return NextResponse.json(comments);
}

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const body = await req.json();
  const { author, content, avatar, rating } = body;

  const comment = await createComment(postId, author, content, avatar, rating);
  return NextResponse.json(comment);
}
