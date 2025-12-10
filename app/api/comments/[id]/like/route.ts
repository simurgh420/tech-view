import { likeComment } from '@/services/comments/queries';
import { NextResponse } from 'next/server';

// app/api/comments/[id]/like/route.ts
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const updated = await likeComment(id);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: `Failed to like comment${error}` }, { status: 500 });
  }
}
