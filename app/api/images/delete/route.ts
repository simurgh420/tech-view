import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { deleteImage } from '@/services/upload/deleteImage';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('POST /api/images/delete - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { imagePath } = body;

    if (!imagePath) {
      logger.warn('POST /api/images/delete - Image path missing', {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Image path is required' }, { status: 400 });
    }

    const ok = await deleteImage(imagePath);
    if (!ok) {
      logger.warn(`POST /api/images/delete - Failed to delete: ${imagePath}`, {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Failed to delete image' }, { status: 400 });
    }

    logger.info('POST /api/images/delete - Success', {
      userId: session.user.id,
      imagePath,
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('POST /api/images/delete failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
