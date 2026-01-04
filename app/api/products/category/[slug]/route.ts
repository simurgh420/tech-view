//app/api/products/category/[slug]/route.ts

import { NextResponse } from 'next/server';
import { getProductsByCategory } from '@/services/products/db/queries';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const products = await getProductsByCategory(slug);
    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/products/category Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load category products' },
      { status: 500 }
    );
  }
}
