// services/upload/uploadImage.ts
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export async function uploadImage(file: File, folder: string, baseName?: string): Promise<string> {
  // اعتبارسنجی اولیه
  if (!file || !folder || typeof folder !== 'string') {
    throw new Error('فایل و پوشه مقصد الزامی است');
  }

  // ۱. جلوگیری از path traversal در نام پوشه
  if (folder.includes('..') || folder.includes('/') || folder.includes('\\')) {
    throw new Error('نام پوشه نامعتبر است');
  }

  // ۲. ساخت مسیر امن
  const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads');
  const targetDir = path.resolve(uploadsRoot, folder);

  // بررسی اینکه پوشه نهایی زیرمجموعه‌ی uploadsRoot باشد
  if (!targetDir.startsWith(uploadsRoot + path.sep)) {
    throw new Error('مسیر ذخیره‌سازی نامعتبر است');
  }

  // ایجاد پوشه در صورت نیاز
  await mkdir(targetDir, { recursive: true });

  // ۳. پاک‌سازی baseName
  let cleanBase: string;
  if (baseName?.trim()) {
    cleanBase =
      baseName
        .toLowerCase()
        .replace(/[^a-z0-9\-]+/g, '-') // فقط حروف، اعداد و خط تیره
        .replace(/^-+|-+$/g, '') || // حذف خط تیره‌های ابتدا و انتها
      'image';
  } else {
    const rawName = file.name.split('.')[0] || 'image';
    cleanBase =
      rawName
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '')
        .replace(/^-+|-+$/g, '') || 'image';
  }

  // ۴. استخراج و ایمن‌سازی پسوند
  const rawExt = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const safeExt = allowedExtensions.includes(rawExt || '') ? rawExt! : 'png';

  // ۵. ساخت نام یکتا با UUID
  const uniqueId = crypto.randomUUID().split('-')[0]; // یا کل UUID
  const uniqueName = `${cleanBase}-${uniqueId}.${safeExt}`;

  // ۶. نوشتن فایل
  const filePath = path.join(targetDir, uniqueName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  // ۷. برگرداندن آدرس نسبی
  return `/uploads/${folder}/${uniqueName}`;
}
