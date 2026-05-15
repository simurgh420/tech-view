import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { editCategorySchema } from '@/lib/validation/category';
import { deleteCategory, updateCategory } from '@/services/categories/db/mutations';
import { getCategoryBySlug } from '@/services/categories/db/queries';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const startTime = Date.now();
  const { slug } = await params;
  try {
    const category = await getCategoryBySlug(slug);
    if (!category) {
      logger.info(`GET /api/categories/${slug} - Not found`, { duration: Date.now() - startTime });
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }
    logger.info(`GET /api/categories/${slug} - Success`, { duration: Date.now() - startTime });
    return NextResponse.json(category);
  } catch (error) {
    logger.error(`GET /api/categories/${slug} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const startTime = Date.now();
  const { slug } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`PATCH /api/categories/${slug} - Unauthorized`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { categories: ['update'] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn(`PATCH /api/categories/${slug} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = editCategorySchema.safeParse(body);
    if (!parsed.success) {
      logger.warn(`PATCH /api/categories/${slug} - Validation failed`, {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const updated = await updateCategory(slug, parsed.data);
    if (!updated) {
      logger.warn(`PATCH /api/categories/${slug} - Category not found`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    logger.info(`PATCH /api/categories/${slug} - Updated`, {
      categoryId: updated.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(updated);
  } catch (error) {
    logger.error(`PATCH /api/categories/${slug} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const startTime = Date.now();
  const { slug } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`DELETE /api/categories/${slug} - Unauthorized`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { categories: ['delete'] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn(`DELETE /api/categories/${slug} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await deleteCategory(slug);
    if (result === null) {
      logger.warn(`DELETE /api/categories/${slug} - Category not found`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    logger.info(`DELETE /api/categories/${slug} - Deleted`, {
      success: true,
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`DELETE /api/categories/${slug} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
