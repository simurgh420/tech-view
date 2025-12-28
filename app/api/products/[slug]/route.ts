// app/api/products/[slug]/route.ts
import { getProductBySlug } from '@/services/products/db/queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}
