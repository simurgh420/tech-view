import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
export const VALID_DOMAINS = () => {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com'];

  if (process.env.NODE_ENV === 'development') {
    domains.push('example.com');
  }

  return domains;
};
