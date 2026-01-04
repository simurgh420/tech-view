// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { getProducts } from '@/services/products/db/queries';
import { createProduct } from '@/services/products/db/mutations';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/products Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load products' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const product = await createProduct(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('POST /api/products Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    );
  }
}
