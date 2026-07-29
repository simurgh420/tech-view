'use client';

import clsx from 'clsx';

type SortValue = 'featured' | 'new' | 'price-asc' | 'price-desc';

type Props = {
  value?: string | null;
  onChange: (val: SortValue) => void;
};

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: 'featured', label: 'پرفروش‌ترین' },
  { value: 'new', label: 'جدیدترین' },
  { value: 'price-asc', label: 'ارزان‌ترین' },
  { value: 'price-desc', label: 'گران‌ترین' },
];

// رنگ برند سایت (همون قرمزی که تو دکمه‌ی «افزودن به سبد» استفاده می‌شه)
const BRAND = '#F3043B';

export default function SortMenu({ value, onChange }: Props) {
  return (
    <section
      aria-label="مرتب‌سازی محصولات"
      className="flex items-center gap-4 border-b border-white/5 pb-3"
    >
      <ul className="no-scrollbar flex items-center gap-6 overflow-x-auto py-1 text-sm">
        {SORT_OPTIONS.map(option => {
          const isActive = option.value === value;

          return (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => onChange(option.value)}
                className={clsx(
                  'relative pb-2 whitespace-nowrap transition-colors duration-200',
                  isActive ? 'font-semibold text-white' : 'text-neutral-400 hover:text-white'
                )}
              >
                {option.label}

                {isActive && (
                  <span
                    className="absolute inset-x-0 bottom-0 h-0.5 rounded-full"
                    style={{ backgroundColor: BRAND }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
