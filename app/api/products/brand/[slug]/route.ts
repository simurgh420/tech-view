//app/api/products/brand/[slug]/route.ts

import { NextResponse } from 'next/server';
import { getProductsByBrand } from '@/services/products/db/queries';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const products = await getProductsByBrand(slug);
    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/products/brand Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
