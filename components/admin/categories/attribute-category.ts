// attribute-category.ts
import { AttributeCategoryId } from '@/types/category';
import type { LucideIcon } from 'lucide-react';
import {
  Layers,
  Smartphone,
  Cpu,
  Monitor,
  Headphones,
  Gamepad2,
  PlugZap,
  FolderKanban,
} from 'lucide-react';


export interface AttributeSelectorItem {
  id: string;
  key: string;
  label: string;
  type: string;
  unit?: string | null;
  category: AttributeCategoryId;
  options?: unknown[];
}

export interface AttributeCategoryMeta {
  id: AttributeCategoryId | 'all';
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
}

// 🎨 دسته‌بندی‌ها با رنگ و آیکون اختصاصی — رنگ‌ها طوری انتخاب شدن که کنار هم قابل تشخیص باشن
export const CATEGORIES: AttributeCategoryMeta[] = [
  {
    id: 'all',
    label: 'همه مشخصه‌ها',
    icon: Layers,
    color: 'text-zinc-500',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
  },
  {
    id: 'mobile',
    label: 'موبایل و تبلت',
    icon: Smartphone,
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
  },
  {
    id: 'computer',
    label: 'لپ‌تاپ و قطعات',
    icon: Cpu,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  {
    id: 'display',
    label: 'نمایشگر و تلویزیون',
    icon: Monitor,
    color: 'text-sky-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  {
    id: 'audio',
    label: 'صدا و هدفون',
    icon: Headphones,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  {
    id: 'gaming',
    label: 'گیمینگ و دوربین',
    icon: Gamepad2,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  {
    id: 'accessories',
    label: 'لوازم جانبی و شبکه',
    icon: PlugZap,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  {
    id: 'other',
    label: 'سایر موارد',
    icon: FolderKanban,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'border-rose-400/30',
  },
];

const CATEGORY_MAP = new Map(CATEGORIES.map(category => [category.id, category]));

const FALLBACK_CATEGORY = CATEGORIES[CATEGORIES.length - 1];

/**
 * دسته‌ی هر مشخصه دیگه حدس زده نمی‌شه؛ مستقیم از فیلد category خودِ attribute
 * (که حالا توی دیتابیس ذخیره می‌شه) خونده می‌شه. این تابع فقط متادیتای بصری
 * (رنگ/آیکون/برچسب) همون دسته رو برمی‌گردونه.
 */
export function getCategoryMeta(categoryId: AttributeCategoryId): AttributeCategoryMeta {
  return CATEGORY_MAP.get(categoryId) ?? FALLBACK_CATEGORY;
}
