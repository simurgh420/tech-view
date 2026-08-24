// src/lib/normalizeFilterKey.ts

// حذف ایموجی‌ها (شامل variation selector مثل ⚖️) و ZWJ
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu;

/**
 * یه کلید خام رو به فرم قابل‌مقایسه تبدیل می‌کنه:
 * - ایموجی حذف می‌شه
 * - دونقطه‌ی انتهایی حذف می‌شه
 * - نیم‌فاصله (ZWNJ) به فاصله تبدیل می‌شه تا اختلاف فاصله‌گذاری مهم نباشه
 * - فاصله‌های تکراری جمع می‌شن
 * - ی/ك عربی به ی/ک فارسی تبدیل می‌شن
 */
export function normalizeRawKey(raw: string): string {
  let key = raw;
  key = key.replace(EMOJI_REGEX, '');
  key = key.replace(/\u200c/g, ' '); // ZWNJ -> space
  key = key.replace(/[:：]+$/g, ''); // دونقطه‌ی انتهایی (نیم‌فاصله‌دار یا نه)
  key = key.replace(/\s+/g, ' ').trim();
  key = key.replace(/ي/g, 'ی').replace(/ك/g, 'ک');
  return key.toLowerCase();
}
