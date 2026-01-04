// src/lib/slug.ts
import { slugify } from 'transliteration/dist/node/src/node';

export function toSlug(title: string): string {
  if (!title || typeof title !== 'string') return '';

  return slugify(title, {
    lowercase: true, // همه حروف کوچک
    separator: '-', // فاصله → خط تیره
    trim: true, // حذف فاصله‌های اول و آخر
    ignore: [], // هیچ کاراکتری را نادیده نگیر
  })
    .replace(/-+/g, '-') // جلوگیری از چند خط تیره پشت‌سرهم
    .replace(/^-+|-+$/g, ''); // حذف خط تیره اول و آخر
}

export function calculateReadingMinutes(content: string): number {
  const words = content.split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.ceil(words / wordsPerMinute);
}
