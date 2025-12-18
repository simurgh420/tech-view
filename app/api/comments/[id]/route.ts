//app/api/comments/[id]/route.ts

import { deleteComment, updateComment } from '@/services/comments/db/mutations';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await updateComment(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update comment failed:', error);
    return NextResponse.json({ error: `Failed to update comment` }, { status: 500 });
  }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const deleted = await deleteComment(id);
    return NextResponse.json(deleted);
  } catch (error) {
    console.error('delete comment failed:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
