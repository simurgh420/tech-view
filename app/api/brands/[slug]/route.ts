// app/api/brands/[slug]/route.ts
import { NextResponse } from 'next/server';
import { getBrandBySlug } from '@/services/brands/db/queries';
import { updateBrandBySlug, deleteBrandBySlug } from '@/services/brands/db/mutations';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const brand = await getBrandBySlug(slug);

    if (!brand) {
      return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error(`GET /api/brands/${slug} Error:`, error);
    return NextResponse.json({ success: false, message: 'Failed to load brand' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const body = await req.json();
    const brand = await updateBrandBySlug(slug, body);

    return NextResponse.json(brand);
  } catch (error) {
    console.error(`PATCH /api/brands/${slug} Error:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to update brand' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const result = await deleteBrandBySlug(slug);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`DELETE /api/brands/${slug} Error:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}
