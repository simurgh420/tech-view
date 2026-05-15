import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getBrands } from '@/services/brands/db/queries';
import { createBrand } from '@/services/brands/db/mutations';
import { auth } from '@/lib/auth';
import { createBrandSchema } from '@/lib/validation/brand';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  try {
    const brands = await getBrands();
    logger.info('GET /api/brands succeeded', {
      count: brands.length,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(brands);
  } catch (error) {
    logger.error('GET /api/brands failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
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
      logger.warn('POST /api/brands - Unauthorized attempt', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { brands: ['create'] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn('POST /api/brands - Forbidden', {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createBrandSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn('POST /api/brands - Validation failed', {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const brand = await createBrand(parsed.data);
    logger.info('POST /api/brands - Brand created', {
      brandId: brand.id,
      userId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    logger.error('POST /api/brands failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
