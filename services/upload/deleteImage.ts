import { stat, unlink } from 'fs/promises';
import path from 'path';

export async function deleteImage(imagePath: string) {
  if (!imagePath) return false;
  // جلوگیری از مسیرهای خطرناک
  if (imagePath.includes('..')) return false;
  // حذف اسلش اول اگر وجود داشته باشد
  const safePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

  const fullPath = path.join(process.cwd(), 'public', safePath);

  try {
    await stat(fullPath);
    await unlink(fullPath);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return false;
    }
    console.error('Error deleting file:', err);
    return false;
  }
}
