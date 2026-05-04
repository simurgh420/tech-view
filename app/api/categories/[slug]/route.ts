// app/api/categories/[slug]/route.ts

import { auth } from '@/lib/auth';
import { editCategorySchema } from '@/lib/validation/category';
import { deleteCategory, updateCategory } from '@/services/categories/db/mutations';
import { getCategoryBySlug } from '@/services/categories/db/queries';
import { headers } from 'next/headers';
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    // ۱. احراز هویت
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ۲. چک دسترسی
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { categories: ['update'] },
      },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = editCategorySchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }
    const updated = await updateCategory(slug, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PATCH /api/categories/${slug} Error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    // ۱. احراز هویت
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ۲. چک دسترسی
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { categories: ['delete'] },
      },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // ۳. حذف
    const result = await deleteCategory(slug);
    if (result === null) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/categories/${slug} Error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
