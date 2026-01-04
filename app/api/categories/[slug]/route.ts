// app/api/categories/[slug]/route.ts

import { deleteCategory, updateCategory } from '@/services/categories/db/mutations';
import { getCategoryBySlug } from '@/services/categories/db/queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const category = await getCategoryBySlug(slug);
    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    console.error(`GET /api/categories/${slug} Error:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to load category' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const body = await req.json();
    const category = await updateCategory(slug, body);
    return NextResponse.json(category);
  } catch (error) {
    console.error(`PATCH /api/categories/${slug} Error:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to update category' },
      { status: 500 }
    );
  }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const result = await deleteCategory(slug);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`DELETE /api/categories/${slug} Error:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
