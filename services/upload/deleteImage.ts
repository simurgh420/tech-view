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

    // 4. ساخت مسیر کامل امن
    const publicDir = path.join(process.cwd(), 'public');
    const fullPath = path.resolve(publicDir, safePath);

    // 5. اطمینان از اینکه مسیر نهایی داخل public است
    if (!fullPath.startsWith(publicDir + path.sep)) {
      logger.error('deleteImage: resolved path outside public directory', {
        imagePath,
        fullPath,
        duration: Date.now() - startTime,
      });
      return false;
    }

    // 6. حذف فایل
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
