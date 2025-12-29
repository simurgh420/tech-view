//app/api/images/upload/route.ts
import { uploadImage } from '@/services/upload/uploadImage';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File;
    const folder = form.get('folder') as string;
    const baseName = form.get('baseName') as string | null;
    if (!file) {
      return NextResponse.json({ success: false, message: 'File is required' }, { status: 400 });
    }
    const imageUrl = await uploadImage(file, folder, baseName || undefined);
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('POST /api/images/upload Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
