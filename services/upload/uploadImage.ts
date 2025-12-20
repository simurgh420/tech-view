// services/upload/uploadImage.ts
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export async function uploadImage(file: File, folder: string = 'uploads', baseName?: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), 'public', folder);
  await mkdir(uploadDir, { recursive: true });

  // پاک‌سازی نام
  const cleanBase = baseName?.trim()
    ? baseName.toLowerCase().replace(/[^a-z0-9\-]+/gi, '-')
    : file.name.split('.')[0].replace(/\s+/g, '-');
  const safeBase = cleanBase || 'image';
  // استخراج پسوند فایل
  const ext = file.name.split('.').pop() || 'png';
  // ساخت نام نهایی
  const uniqueName = `${safeBase}-${Date.now()}.${ext}`;
  const filePath = path.join(uploadDir, uniqueName);

  await writeFile(filePath, buffer);

  return `/${folder}/${uniqueName}`;
}
