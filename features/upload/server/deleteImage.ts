// services/upload/deleteImage.ts
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { logger } from '@/lib/logger';

export async function deleteImage(imagePath: string): Promise<boolean> {
  const startTime = Date.now();
  try {
    // 1. اعتبارسنجی اولیه
    if (!imagePath || typeof imagePath !== 'string') {
      logger.warn('deleteImage: invalid imagePath', {
        imagePath,
        duration: Date.now() - startTime,
      });
      return false;
    }

    // 2. جلوگیری از path traversal
    if (imagePath.includes('..')) {
      logger.warn('deleteImage: path traversal detected', {
        imagePath,
        duration: Date.now() - startTime,
      });
      return false;
    }

    // 3. حذف اسلش ابتدایی
    const safePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    if (!safePath) {
      logger.warn('deleteImage: empty path after cleaning', {
        imagePath,
        duration: Date.now() - startTime,
      });
      return false;
    }

    // 4. محدود به public/uploads (نه کل public) — جلوگیری از حذف فایل‌های استاتیک حیاتی سایت
    const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads');
    const fullPath = path.resolve(process.cwd(), 'public', safePath);

    if (!fullPath.startsWith(uploadsRoot + path.sep)) {
      logger.error('deleteImage: resolved path outside uploads directory', {
        imagePath,
        fullPath,
        duration: Date.now() - startTime,
      });
      return false;
    }

    // 5. حذف فایل
    await rm(fullPath, { force: true });
    logger.info('deleteImage success', {
      imagePath,
      fullPath,
      duration: Date.now() - startTime,
    });
    return true;
  } catch (error) {
    logger.error('deleteImage failed', {
      imagePath,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return false;
  }
}
