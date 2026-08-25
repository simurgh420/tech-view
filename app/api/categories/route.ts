// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { createCategorySchema } from '@/lib/validation/category';
import { createCategory } from '@/services/categories/db/mutations';
import { logger } from '@/lib/logger';
import { getCategories } from '@/services/categories/db/queries';

export async function GET() {
  const startTime = Date.now();
  try {
    const categories = await getCategories();
    logger.info('GET /api/categories succeeded', {
      count: categories.length,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(categories);
  } catch (error) {
    logger.error('GET /api/categories failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('POST /api/categories - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permissions: { categories: ['create'] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn('POST /api/categories - Forbidden', {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      logger.warn('POST /api/categories - Validation failed', {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const category = await createCategory(parsed.data);
    logger.info('POST /api/categories - Category created', {
      categoryId: category.id,
      userId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    logger.error('POST /api/categories failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
