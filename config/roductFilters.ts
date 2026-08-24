// src/config/productFilters.ts

export interface FilterKeyConfig {
  label: string;
  enabled: boolean;
  order?: number;
}

// -----------------------------------------------------------------------
// کلیدهای استاندارد (canonical) که در خروجی API استفاده می‌شن
// -----------------------------------------------------------------------
export const ALLOWED_FILTER_KEYS: Record<string, FilterKeyConfig> = {
  processor: { label: 'پردازنده', enabled: true, order: 1 },
  gpu: { label: 'پردازنده گرافیکی', enabled: true, order: 2 },
  ram: { label: 'رم', enabled: true, order: 3 },
  storage: { label: 'حافظه داخلی', enabled: true, order: 4 },
  screen_type: { label: 'فناوری صفحه‌نمایش', enabled: true, order: 5 },
  refresh_rate: { label: 'نرخ به‌روزرسانی تصویر', enabled: true, order: 6 },
  brightness: { label: 'روشنایی صفحه‌نمایش', enabled: true, order: 7 },
  battery_capacity: { label: 'باتری', enabled: true, order: 8 },
  fast_charging: { label: 'شارژ سریع', enabled: true, order: 9 },
  wired_charging_power: { label: 'توان شارژ سیمی', enabled: true, order: 10 },
  wireless_charging: { label: 'شارژ بی‌سیم', enabled: true, order: 11 },
  main_camera: { label: 'دوربین اصلی', enabled: true, order: 12 },
  ultrawide_camera: { label: 'دوربین فوق‌عریض', enabled: true, order: 13 },
  telephoto_camera: { label: 'دوربین تله‌فوتو', enabled: true, order: 14 },
  selfie_camera: { label: 'دوربین سلفی', enabled: true, order: 15 },
  network: { label: 'شبکه', enabled: true, order: 16 },
  water_resistance: { label: 'مقاومت در برابر آب', enabled: true, order: 17 },
  os: { label: 'سیستم‌عامل', enabled: true, order: 18 },
  weight: { label: 'وزن', enabled: true, order: 19 },
  usage: { label: 'مناسب برای', enabled: true, order: 20 },

  // این دوتا معمولاً متن توصیفیِ طولانی و متغیرن (نه مقدار کوتاه ثابت)
  // پس برای چک‌باکس فیلتر مناسب نیستن. اگه مقادیرشون واقعاً کوتاه و
  // محدوده، enabled رو true کنید.
  display: { label: 'نمایشگر', enabled: false, order: 21 },
  audio: { label: 'صدا', enabled: false, order: 22 },
  size: { label: 'اندازه', enabled: false, order: 23 }, // مبهمه، مشخص نیست اندازه‌ی چی
};

// -----------------------------------------------------------------------
// نگاشت کلید خامِ نرمال‌شده -> کلید استاندارد
// کلیدهای این دیکشنری باید از قبل با normalizeRawKey() پردازش شده باشن
// -----------------------------------------------------------------------
export const RAW_KEY_ALIASES: Record<string, string> = {
  cpu: 'processor',
  پردازنده: 'processor',

  'پردازنده گرافیکی': 'gpu',

  رم: 'ram',

  'حافظه داخلی': 'storage',

  'فناوری صفحه نمایش': 'screen_type',

  'نرخ به روزرسانی تصویر': 'refresh_rate',
  'نرخ نوسازی': 'refresh_rate',

  'روشنایی صفحه نمایش': 'brightness',
  'حداکثر روشنایی': 'brightness',

  باتری: 'battery_capacity',

  'شارژ سریع': 'fast_charging',
  'شارژ سیمی': 'wired_charging_power',
  'شارژ بی سیم': 'wireless_charging',

  'دوربین اصلی': 'main_camera',
  'دوربین فوق عریض': 'ultrawide_camera',
  'دوربین تله فوتو': 'telephoto_camera',
  'دوربین سلفی': 'selfie_camera',

  شبکه: 'network',
  مقاومت: 'water_resistance',
  'سیستم عامل': 'os',
  وزن: 'weight',
  'مناسب برای': 'usage',

  نمایشگر: 'display',
  صدا: 'audio',
  اندازه: 'size',
};

export const VALUE_ALIASES: Record<string, Record<string, string>> = {
  network: {
    '4g': '4G',
    '5g': '5G',
    lte: '4G',
  },
  os: {
    android: 'اندروید',
    ios: 'iOS',
  },
  fast_charging: {
    yes: 'دارد',
    no: 'ندارد',
  },
  wireless_charging: {
    yes: 'دارد',
    no: 'ندارد',
  },
  water_resistance: {
    yes: 'دارد',
    no: 'ندارد',
  },
};

export function getEnabledFilterKeys(): string[] {
  return Object.entries(ALLOWED_FILTER_KEYS)
    .filter(([, cfg]) => cfg.enabled)
    .sort(([, a], [, b]) => (a.order ?? 99) - (b.order ?? 99))
    .map(([key]) => key);
}
