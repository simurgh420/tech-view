// src/lib/slug.ts

import prisma from '@/services/db/client';

export function toSlug(title: string): string {
  if (!title || typeof title !== 'string') return '';

  return (
    title
      .trim()
      // نرمال‌سازی ی و ک عربی → فارسی (برای جلوگیری از mismatch در DB)
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')

      // حذف علائم نگارشی رایج
      .replace(/[!؛،؟,.]/g, '')

      // تبدیل فاصله‌ها و نیم‌فاصله‌ها به خط‌تیره
      .replace(/\s+/g, '-')
      .replace(/\u200c/g, '-') // نیم‌فاصله (ZWNJ)

      // ادغام خط‌تیره‌های پیاپی
      .replace(/-+/g, '-')

      // حذف خط‌تیره ابتدا و انتها
      .replace(/^-+|-+$/g, '')
  );
}

export function calculateReadingMinutes(content: string): number {
  const words = content.split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.ceil(words / wordsPerMinute);
}

export async function generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  const MAX_ATTEMPTS = 50;

  while (counter <= MAX_ATTEMPTS) {
    const existing = await prisma.blogPost.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  throw new Error(
    `Unable to generate unique slug for "${baseSlug}" after ${MAX_ATTEMPTS} attempts`
  );
}
