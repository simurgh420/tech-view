// services/upload/uploadImage.ts
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileTypeFromBuffer } from 'file-type';
import { logger } from '@/lib/logger';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadImage(file: File, folder: string, baseName?: string): Promise<string> {
  const startTime = Date.now();
  try {
    // 1. اعتبارسنجی اولیه
    if (!file || !folder) {
      throw new Error('فایل و پوشه مقصد الزامی است');
    }

    // 2. محدودیت حجم فایل (جلوگیری از پر شدن دیسک سرور)
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('حجم فایل نباید بیشتر از ۵ مگابایت باشد');
    }
    if (file.size === 0) {
      throw new Error('فایل خالی است');
    }

    // 3. چک اولیه‌ی MIME (لایه‌ی سریع، قابل جعل توسط کلاینت — چک نهایی با magic bytes پایین‌تر است)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error('نوع فایل مجاز نیست');
    }

    // 4. جلوگیری از path traversal (فقط `..` ممنوع است)
    if (folder.includes('..')) {
      throw new Error('نام پوشه نامعتبر است');
    }

    // 5. ساخت مسیر امن
    const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads');
    const targetDir = path.resolve(uploadsRoot, folder);

    // اطمینان از اینکه پوشه نهایی زیرمجموعه uploadsRoot است
    if (!targetDir.startsWith(uploadsRoot + path.sep)) {
      throw new Error('مسیر ذخیره‌سازی نامعتبر است');
    }

    // 6. پاک‌سازی نام پایه (baseName)
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

    // 7. خواندن محتوای فایل (یک‌بار، برای چک magic bytes و نوشتن نهایی)
    const buffer = Buffer.from(await file.arrayBuffer());

    // 8. تشخیص نوع واقعی فایل از روی محتوا (نه از روی اسم/پسوند که قابل جعل است)
    const detectedType = await fileTypeFromBuffer(buffer);
    if (!detectedType || !ALLOWED_EXTENSIONS.includes(detectedType.ext as any)) {
      logger.warn('uploadImage: content type mismatch or unsupported', {
        folder,
        declaredMime: file.type,
        detectedMime: detectedType?.mime,
        detectedExt: detectedType?.ext,
      });
      throw new Error('محتوای فایل با نوع تصویر مجاز مطابقت ندارد');
    }

    // pngهایی که در واقع jpg/webp هستن یا برعکس رو هم اینجا رد می‌کنیم، پسوند نهایی از روی محتوای واقعی تعیین می‌شود
    const safeExt = detectedType.ext;

    // 9. ایجاد پوشه (بعد از عبور از تمام اعتبارسنجی‌ها، نه قبل‌تر)
    await mkdir(targetDir, { recursive: true });

    // 10. ساخت نام یکتا با UUID
    const uniqueId = crypto.randomUUID().split('-')[0];
    const uniqueName = `${cleanBase}-${uniqueId}.${safeExt}`;

    // 11. نوشتن فایل
    const filePath = path.join(targetDir, uniqueName);
    await writeFile(filePath, buffer);

    // 12. برگرداندن آدرس نسبی
    const relativePath = `/uploads/${folder}/${uniqueName}`;
    logger.info('uploadImage success', {
      folder,
      fileName: uniqueName,
      size: buffer.length,
      detectedMime: detectedType.mime,
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
