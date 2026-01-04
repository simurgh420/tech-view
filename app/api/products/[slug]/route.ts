// app/api/products/[slug]/route.ts
import { NextResponse } from 'next/server';
import { getProductBySlug } from '@/services/products/db/queries';
import { deleteProduct, updateProduct } from '@/services/products/db/mutations';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product)
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error(`GET /api/products/${slug} Error:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to load product' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const body = await req.json();
    const product = await updateProduct(slug, body);
    return NextResponse.json(product);
  } catch (error) {
    console.error(`PATCH /api/products/${slug} Error:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const result = await deleteProduct(slug);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`DELETE /api/products/${slug} Error:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
