//app/api/products/featured/route.ts

import { getFeaturedProducts } from '@/services/products/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await getFeaturedProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/products/featured Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load featured products' },
      { status: 500 }
    );
  }
}
