// app/api/wishlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { wishlistItemSchema } from '@/lib/validation/wishlist';
import {
  addToWishlist,
  deleteWishlistItemByUserAndProduct,
} from '@/services/wishlist/db/mutations';
import { getWishlist } from '@/services/wishlist/db/queries';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('GET /api/wishlist - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await getWishlist(session.user.id);
    logger.info('GET /api/wishlist succeeded', {
      userId: session.user.id,
      count: items.length,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(items);
  } catch (error) {
    logger.error('GET /api/wishlist failed', {
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
      logger.warn('POST /api/wishlist - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permission: { wishlist: ['create'] } },
    });
    if (permission.error || !permission.success) {
      logger.warn('POST /api/wishlist - Forbidden', {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = wishlistItemSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn('POST /api/wishlist - Validation failed', {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const item = await addToWishlist(session.user.id, parsed.data.productId);
    logger.info('POST /api/wishlist - Item added', {
      userId: session.user.id,
      productId: parsed.data.productId,
      wishlistItemId: item.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    logger.error('POST /api/wishlist failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('DELETE /api/wishlist - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = wishlistItemSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn('DELETE /api/wishlist - Validation failed', {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    await deleteWishlistItemByUserAndProduct(session.user.id, parsed.data.productId);
    logger.info('DELETE /api/wishlist - Item removed', {
      userId: session.user.id,
      productId: parsed.data.productId,
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/wishlist failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
