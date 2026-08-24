// src/lib/normalizeFilterValue.ts

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

function normalizeDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, d => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, d => String(ARABIC_DIGITS.indexOf(d)));
}

function normalizeArabicChars(input: string): string {
  return input
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c/g, ' '); // نیم‌فاصله رو اسپیس کن (یا برعکس، بسته به نیازتون)
}

export function normalizeFilterValue(
  key: string,
  rawValue: string,
  aliases: Record<string, Record<string, string>>
): string {
  let value = rawValue.trim();
  value = normalizeDigits(value);
  value = normalizeArabicChars(value);
  value = value.replace(/\s+/g, ' ');

  const keyAliases = aliases[key];
  if (keyAliases && keyAliases[value.toLowerCase()]) {
    return keyAliases[value.toLowerCase()];
  }

  return value;
}
