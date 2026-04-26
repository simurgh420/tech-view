// services/upload/deleteImage.ts
import { rm } from 'fs/promises';
import path from 'path';

export async function deleteImage(imagePath: string) {
  // اعتبارسنجی اولیه
  if (!imagePath || typeof imagePath !== 'string') return false;
  if (imagePath.includes('..')) {
    console.warn('deleteImage: path traversal detected:', imagePath);
    return false;
  }
  // حذف اسلش ابتدایی و جلوگیری از مسیر خالی
  const safePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  if (!safePath) return false;
  // ساخت مسیر کامل امن
  const publicDir = path.join(process.cwd(), 'public');
  const fullPath = path.resolve(publicDir, safePath);
  // بررسی اینکه مسیر نهایی داخل public است
  if (!fullPath.startsWith(publicDir + path.sep)) {
    console.error('deleteImage: resolved path outside public directory');
    return false;
  }

  try {
    await rm(fullPath, { force: true });
    return true;
  } catch (err: any) {
    console.error('deleteImage: error deleting file:', err);
    return false;
  }
}
