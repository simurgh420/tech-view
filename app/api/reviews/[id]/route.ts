// app/api/reviews/[id]/route.ts

import { deleteReview, updateReview } from '@/services/reviews/db/mutations';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const review = await updateReview(id, body);
  return NextResponse.json(review);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = await deleteReview(id);
  return NextResponse.json(review);
}
