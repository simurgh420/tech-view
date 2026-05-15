// services/upload/uploadImage.ts
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { logger } from '@/lib/logger';

export async function uploadImage(file: File, folder: string, baseName?: string): Promise<string> {
  const startTime = Date.now();
  try {
    // 1. اعتبارسنجی اولیه
    if (!file || !folder) {
      throw new Error('فایل و پوشه مقصد الزامی است');
    }

    // 2. جلوگیری از path traversal (فقط `..` ممنوع است)
    if (folder.includes('..')) {
      throw new Error('نام پوشه نامعتبر است');
    }

    // 3. ساخت مسیر امن
    const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads');
    const targetDir = path.resolve(uploadsRoot, folder);

    // اطمینان از اینکه پوشه نهایی زیرمجموعه uploadsRoot است
    if (!targetDir.startsWith(uploadsRoot + path.sep)) {
      throw new Error('مسیر ذخیره‌سازی نامعتبر است');
    }

    // ایجاد پوشه در صورت نیاز
    await mkdir(targetDir, { recursive: true });

    // 4. پاک‌سازی نام پایه (baseName)
    let cleanBase: string;
    if (baseName?.trim()) {
      cleanBase = baseName
        .toLowerCase()
        .replace(/[^a-z0-9\-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (!cleanBase) cleanBase = 'image';
    } else {
      const rawName = file.name.split('.')[0] || 'image';
      cleanBase =
        rawName
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\-]/g, '')
          .replace(/^-+|-+$/g, '') || 'image';
    }

    // 5. استخراج و ایمن‌سازی پسوند
    const rawExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const safeExt = allowedExtensions.includes(rawExt || '') ? rawExt! : 'png';

    // 6. ساخت نام یکتا با UUID
    const uniqueId = crypto.randomUUID().split('-')[0];
    const uniqueName = `${cleanBase}-${uniqueId}.${safeExt}`;

    // 7. نوشتن فایل
    const filePath = path.join(targetDir, uniqueName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // 8. برگرداندن آدرس نسبی
    const relativePath = `/uploads/${folder}/${uniqueName}`;
    logger.info('uploadImage success', {
      folder,
      fileName: uniqueName,
      size: buffer.length,
      duration: Date.now() - startTime,
    });
    return relativePath;
  } catch (error) {
    logger.error('uploadImage failed', {
      folder,
      baseName,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
