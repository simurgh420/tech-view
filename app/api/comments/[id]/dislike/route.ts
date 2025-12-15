// app/api/comments/[id]/dislike/route.ts
import { dislikeComment } from '@/services/comments/db/mutations';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const updated = await dislikeComment(id);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: `Failed to dislike comment${error}` }, { status: 500 });
  }
}
