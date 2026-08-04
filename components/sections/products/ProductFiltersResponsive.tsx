'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import ProductFilters from './ProductFilters';
import type { FiltersProduct } from '@/types/product';

type Props = {
  onChange: (filters: Partial<FiltersProduct>) => void;
  initialCategorySlug?: string;
  activeFilterCount?: number;
};

export default function ProductFiltersResponsive({
  onChange,
  initialCategorySlug,
  activeFilterCount = 0,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // قفل اسکرول پس‌زمینه وقتی شیت بازه
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  function handleChange(filters: Partial<FiltersProduct>) {
    onChange(filters);
    setIsOpen(false); // بعد از اعمال فیلترها، شیت خودکار بسته بشه
  }

  return (
    <>
      {/* دسکتاپ: sidebar همیشه نمایان */}
      <div className="hidden lg:block">
        <ProductFilters onChange={onChange} initialCategorySlug={initialCategorySlug} />
      </div>

      {/* موبایل: دکمه‌ی شناور برای باز کردن فیلترها */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        فیلترها
        {activeFilterCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-[11px]">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* موبایل: بک‌دراپ + باتم‌شیت */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${isOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!isOpen}
      >
        <div
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div
          className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl transition-transform duration-300 ease-out ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <ProductFilters
            onChange={handleChange}
            initialCategorySlug={initialCategorySlug}
            onClose={() => setIsOpen(false)}
          />
        </div>
      </div>
    </>
  );
}
