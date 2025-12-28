// app/api/brands/[slug]/route.ts

import { getBrandBySlug } from '@/services/brands/db/queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) {
    return NextResponse.json({ message: 'Brand not found' }, { status: 404 });
  }
  return NextResponse.json(brand);
}
