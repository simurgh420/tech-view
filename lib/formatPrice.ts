// lib/formatPrice.ts
const DEFAULT_LOCALE = 'en-US';

export function formatPrice(value: string | number, locale: string = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale).format(Number(value));
}
