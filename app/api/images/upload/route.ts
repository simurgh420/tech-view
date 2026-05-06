//app/api/images/upload/route.ts
import { auth } from '@/lib/auth';
import { uploadImage } from '@/services/upload/uploadImage';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. احراز هویت

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // 2. دریافت فایل و اطلاعات
    const form = await req.formData();
    const file = form.get('file') as File;
    const folder = form.get('folder') as string;
    const baseName = form.get('baseName') as string | null;
    if (!file) {
      return NextResponse.json({ success: false, message: 'File is required' }, { status: 400 });
    }
    // 3. آپلود

    const imageUrl = await uploadImage(file, folder, baseName || undefined);
    return NextResponse.json({ imageUrl }, { status: 201 });
  } catch (error) {
    console.error('POST /api/images/upload Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
