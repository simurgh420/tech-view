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

export default function SortMenu({ value, onChange }: Props) {
  return (
    <section aria-label="مرتب‌سازی محصولات" className="flex items-center gap-4 border-b pb-3">
      {/* Sort options */}
      <ul
        className="
          flex items-center gap-6
          overflow-x-auto
          no-scrollbar
          text-sm
          py-1
        "
      >
        {SORT_OPTIONS.map(option => {
          const isActive = option.value === value;

          return (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => onChange(option.value)}
                className={clsx(
                  'relative pb-2 transition-colors duration-200 whitespace-nowrap',
                  isActive
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {option.label}

                {isActive && (
                  <span
                    className="
                      absolute
                      bottom-0
                      right-0
                      left-0
                      h-0.5
                      bg-primary
                      rounded-full
                    "
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
