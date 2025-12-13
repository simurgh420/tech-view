// src/lib/slug.ts
import { slugify } from 'transliteration';
export function toSlug(title: string): string {
  return slugify(title, { separator: '-', trim: true }).toLowerCase();
}
export function calculateReadingMinutes(content: string): number {
  const words = content.split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.ceil(words / wordsPerMinute);
}
