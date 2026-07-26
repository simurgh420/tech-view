// src/lib/client-slug.ts
export function toSlug(title: string, maxLength = 100): string {
  if (!title || typeof title !== 'string') return '';

  return title
    .normalize('NFKC') // یکسان‌سازی فرم یونیکد (جلوگیری از دو کد متفاوت برای یک حرف)
    .toLowerCase()
    .trim()
    .replace(/ي/g, 'ی') // عربی -> فارسی
    .replace(/ك/g, 'ک') // عربی -> فارسی
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // حذف اعراب و علائم قرآنی
    .replace(/[«»"'`,.!؟?؛;:()[\]{}<>@#$%^&*+=|/\\~_٪×÷]/g, '') // حذف علائم نگارشی/نمادها
    .replace(/[\s\u00A0\u200c\u200e\u200f]+/g, '-') // فاصله، نیم‌فاصله، NBSP، کاراکترهای جهت‌دهنده -> خط تیره
    .replace(/-+/g, '-') // چند خط‌تیره پشت‌سرهم -> یکی
    .replace(/^-+|-+$/g, '') // خط‌تیره اضافه اول/آخر
    .slice(0, maxLength)
    .replace(/-+$/, ''); // اگر برش، انتهای رشته را با خط‌تیره ناقص رها کرد، پاکش کن
}
export function calculateReadingMinutes(content: string): number {
  const words = content.split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.ceil(words / wordsPerMinute);
}
