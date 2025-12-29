// app/api/comments/[id]/unlike/route.ts

import { unlikeComment } from '@/services/comments/db/mutations';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const updated = await unlikeComment(id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('unlike comment failed:', error);
    return NextResponse.json({ error: 'Failed to unlike comment' }, { status: 500 });
  }
}
