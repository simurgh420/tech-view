import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getBrandBySlug } from '@/services/brands/db/queries';
import { updateBrandBySlug, deleteBrandBySlug } from '@/services/brands/db/mutations';
import { auth } from '@/lib/auth';
import { editBrandSchema } from '@/lib/validation/brand';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const startTime = Date.now();
  const { slug } = await params;
  try {
    const brand = await getBrandBySlug(slug);
    if (!brand) {
      logger.warn(`GET /api/brands/${slug} - Not found`, { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }
    logger.info(`GET /api/brands/${slug} - Success`, { duration: Date.now() - startTime });
    return NextResponse.json(brand);
  } catch (error) {
    logger.error(`GET /api/brands/${slug} failed`, {
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
      logger.warn(`PATCH /api/brands/${slug} - Unauthorized`, { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { brands: ['update'] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn(`PATCH /api/brands/${slug} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = editBrandSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn(`PATCH /api/brands/${slug} - Validation failed`, {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const brand = await updateBrandBySlug(slug, parsed.data);
    logger.info(`PATCH /api/brands/${slug} - Updated`, {
      brandId: brand.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(brand);
  } catch (error) {
    logger.error(`PATCH /api/brands/${slug} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const startTime = Date.now();
  const { slug } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`DELETE /api/brands/${slug} - Unauthorized`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { brands: ['delete'] },
      },
    });
    if (permission.error || !permission.success) {
      logger.warn(`DELETE /api/brands/${slug} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await deleteBrandBySlug(slug);
    if (result === null) {
      logger.warn(`DELETE /api/brands/${slug} - Brand not found`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }
    logger.info(`DELETE /api/brands/${slug} - Deleted`, {
      success: true,
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`DELETE /api/brands/${slug} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
