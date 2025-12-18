// app/api/comments/[id]/like/route.ts
import { likeComment } from '@/services/comments/db/mutations';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const updated = await likeComment(id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('like comment failed:', error);
    return NextResponse.json({ error: 'Failed to like comment' }, { status: 500 });
  }
}
