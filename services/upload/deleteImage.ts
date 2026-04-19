// services/upload/deleteImage.ts
import { stat, unlink } from 'fs/promises';
import path from 'path';

export async function deleteImage(imagePath: string) {
  if (!imagePath) return false;
  if (imagePath.includes('..')) return false;

  const safePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const fullPath = path.join(process.cwd(), 'public', safePath);

  try {
    await stat(fullPath);
    await unlink(fullPath);
    return true;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.warn('deleteImage: file not found:', fullPath);
      return false;
    }
    console.error('Error deleting file:', err);
    return false;
  }
}
