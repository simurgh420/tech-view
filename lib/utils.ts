import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeName(name: unknown): string {
  if (typeof name !== 'string') return '';

  const unicodeNormalized = name.normalize('NFKC');

  const cleaned = unicodeNormalized.replace(/[^a-zA-Zآ-ی\s]/g, '');

  const collapsed = cleaned.trim().replace(/\s+/g, ' ');

  if (!collapsed) return '';

  const normalized = collapsed
    .split(' ')
    .map(word => {
      const first = word.charAt(0).toUpperCase();
      const rest = word.slice(1).toLowerCase();
      return first + rest;
    })
    .join(' ');

  return normalized;
}
export function isValidEmail(email: string): boolean {
  // بررسی وجود و نوع داده
  if (!email || typeof email !== 'string') return false;

  // حذف فضاهای خالی از دو طرف
  const trimmedEmail = email.trim();

  // بررسی طول (جلوگیری از حملات DoS)
  if (trimmedEmail.length > 255) return false;

  // ریجکس ساده و کارآمد برای ایمیل
  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;

  return emailRegex.test(trimmedEmail);
}

// (اختیاری) نسخه با نرمالایز کردن
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// (اختیاری) نسخه کاملتر با خطای اختصاصی
export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
  normalizedEmail?: string;
} {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'ایمیل الزامی است' };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return { isValid: false, error: 'ایمیل نمی‌تواند خالی باشد' };
  }

  if (trimmedEmail.length > 255) {
    return { isValid: false, error: 'ایمیل terlalu طولانی است' };
  }

  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'فرمت ایمیل معتبر نیست' };
  }

  return {
    isValid: true,
    normalizedEmail: trimmedEmail.toLowerCase(),
  };
}
