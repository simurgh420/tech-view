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
