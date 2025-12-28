// app/api/wishlist/[id]/route.ts

import { removeFromWishlist } from '@/services/wishlist/db/mutations';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await removeFromWishlist(id);
  return NextResponse.json(result);
}
