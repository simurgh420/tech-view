///app/api/images/delete/route.ts
import { auth } from '@/lib/auth';
import { deleteImage } from '@/services/upload/deleteImage';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. احراز هویت
    
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // 2. دریافت مسیر تصویر

    const { imagePath } = await req.json();
    if (!imagePath) {
      return NextResponse.json({ error: 'Image path is required' }, { status: 400 });
    }
    // 3. حذف

    const ok = await deleteImage(imagePath);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to delete image' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API delete-image error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
