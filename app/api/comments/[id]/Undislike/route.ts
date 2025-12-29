// app/api/comments/[id]/undislike/route.ts
import { undislikeComment } from '@/services/comments/db/mutations';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const updated = await undislikeComment(id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('undislike comment failed:', error);
    return NextResponse.json({ error: 'Failed to undislike comment' }, { status: 500 });
  }
}
