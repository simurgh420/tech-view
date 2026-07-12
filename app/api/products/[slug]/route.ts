// app/api/products/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getProductBySlug } from '@/services/products/db/queries';
import { deleteProduct, updateProduct } from '@/services/products/db/mutations';
import { updateProductSchema } from '@/lib/validation/product';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const startTime = Date.now();
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      logger.warn(`GET /api/products/${slug} - Not found`, { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    logger.info(`GET /api/products/${slug} - Success`, { duration: Date.now() - startTime });
    return NextResponse.json(product);
  } catch (error) {
    logger.error(`GET /api/products/${slug} failed`, {
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
      logger.warn(`PATCH /api/products/${slug} - Unauthorized`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permissions: { products: ['update'] } },
    });
    if (permission.error || !permission.success) {
      logger.warn(`PATCH /api/products/${slug} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn(`PATCH /api/products/${slug} - Validation failed`, {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const product = await updateProduct(slug, parsed.data);
    if (!product) {
      logger.warn(`PATCH /api/products/${slug} - Product not found`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    logger.info(`PATCH /api/products/${slug} - Updated`, {
      productId: product.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(product);
  } catch (error: any) {
    logger.error(`PATCH /api/products/${slug} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    if (error.message?.includes('already taken') || error.message?.includes('unique constraint')) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const startTime = Date.now();
  const { slug } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`DELETE /api/products/${slug} - Unauthorized`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permissions: { products: ['delete'] } },
    });
    if (permission.error || !permission.success) {
      logger.warn(`DELETE /api/products/${slug} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await deleteProduct(slug);
    if (!result) {
      logger.warn(`DELETE /api/products/${slug} - Product not found`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    logger.info(`DELETE /api/products/${slug} - Deleted`, { duration: Date.now() - startTime });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`DELETE /api/products/${slug} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
