import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { uploadImage } from '@/services/upload/uploadImage';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('POST /api/images/upload - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get('file') as File;
    const folder = form.get('folder') as string;
    const baseName = form.get('baseName') as string | null;

    if (!file) {
      logger.warn('POST /api/images/upload - No file provided', {
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ success: false, message: 'File is required' }, { status: 400 });
    }

    const imageUrl = await uploadImage(file, folder, baseName || undefined);
    logger.info('POST /api/images/upload - Success', {
      userId: session.user.id,
      folder,
      fileSize: file.size,
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ imageUrl }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/images/upload failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
