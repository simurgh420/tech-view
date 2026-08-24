'use client';

import { useState } from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import type { FiltersProduct } from '@/types/product';
import { useProductFilters } from '@/hooks/useProducts';

type Props = {
  onChange: (filters: Partial<FiltersProduct>) => void;
  initialCategorySlug?: string;
  onClose?: () => void;
};

export default function ProductFilters({ onChange, initialCategorySlug, onClose }: Props) {
  const PRICE_MIN = 0;
  const PRICE_MAX = 500_000_000;

  const [priceRange, setPriceRange] = useState<number[]>([PRICE_MIN, PRICE_MAX]);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const { data: specFilters, isLoading: filtersLoading } = useProductFilters(
    initialCategorySlug ?? ''
  );

  const selectedCount = Object.keys(selectedSpecs).length;
  const priceChanged = priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX;

  function emit() {
    onChange({
      ...(priceChanged && { minPrice: priceRange[0], maxPrice: priceRange[1] }),
      ...(selectedCount > 0 && { specs: selectedSpecs }),
    });
  }

  function handleSpecChange(key: string, value: string) {
    setSelectedSpecs(prev => {
      const next = { ...prev };
      if (next[key] === value) delete next[key];
      else next[key] = value;
      return next;
    });
  }

  function toggleGroup(key: string) {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function clearAll() {
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setSelectedSpecs({});
    onChange({ minPrice: undefined, maxPrice: undefined, specs: undefined });
  }

  return (
    <div className="rounded-xl border border-white/5 bg-neutral-900 shadow-lg shadow-black/20">
      {/* هدر */}
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-neutral-400" />
          <h3 className="text-base font-semibold text-white">فیلترها</h3>
          {selectedCount > 0 && (
            <span
              className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px]
            font-medium text-primary-foreground"
            >
              {selectedCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {(selectedCount > 0 || priceChanged) && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-neutral-400 transition-colors hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              پاک کردن
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="بستن فیلترها"
              className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {/* محدوده قیمت */}
        <div className="px-5 py-4">
          <button
            type="button"
            onClick={() => setIsPriceOpen(p => !p)}
            className="flex w-full items-center justify-between text-sm"
          >
            <span className="font-medium text-white">محدوده قیمت</span>
            <span className="flex items-center gap-2 text-xs text-neutral-400">
              {priceRange[0].toLocaleString('fa-IR')} تا {priceRange[1].toLocaleString('fa-IR')}{' '}
              تومان
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isPriceOpen ? 'rotate-180' : ''
                }`}
              />
            </span>
          </button>

          <div
            className="grid transition-[grid-template-rows] duration-200 ease-out"
            style={{ gridTemplateRows: isPriceOpen ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden">
              <div className="px-1 pt-5">
                <Slider
                  range
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={1000}
                  value={priceRange}
                  onChange={value => {
                    if (Array.isArray(value)) setPriceRange(value);
                  }}
                  styles={{
                    track: { backgroundColor: 'var(--primary)', height: 4 },
                    handle: {
                      borderColor: 'var(--primary)',
                      backgroundColor: '#171717',
                      opacity: 1,
                      width: 16,
                      height: 16,
                      marginTop: -6,
                      boxShadow: '0 0 0 4px color-mix(in oklch, var(--primary) 20%, transparent)',
                    },
                    rail: { backgroundColor: '#262626', height: 4 },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* لودینگ */}
        {filtersLoading && (
          <div className="px-5 py-4 text-sm text-neutral-400">در حال بارگذاری فیلترها...</div>
        )}

        {/* فیلترهای پویا (مشخصات فنی) */}
        {specFilters &&
          Object.entries(specFilters).map(([key, group]) => {
            const isOpen = openGroups.has(key);
            const activeValue = selectedSpecs[key];
            const label = group.label ?? key;
            const values = group.values ?? [];

            if (values.length === 0) return null;

            return (
              <div key={key} className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => toggleGroup(key)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition-colors hover:bg-white/5"
                >
                  <span className="flex items-center gap-2 font-medium text-white">
                    {label}
                    {activeValue && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-normal text-primary">
                        {' '}
                        {activeValue}
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className="grid transition-[grid-template-rows] duration-200 ease-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-0.5 px-2 pb-1 pt-2">
                      {values.map(v => {
                        const checked = selectedSpecs[key] === v;
                        const id = `${key}-${v}`;

                        return (
                          <label
                            key={v}
                            htmlFor={id}
                            className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-white/5"
                          >
                            <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                              <input
                                id={id}
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleSpecChange(key, v)}
                                className="peer sr-only"
                              />
                              <span
                                className="h-4 w-4 rounded border transition-colors"
                                style={{
                                  borderColor: checked ? 'var(--primary)' : '#404040',
                                  backgroundColor: checked ? 'var(--primary)' : 'transparent',
                                }}
                              />
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className={`pointer-events-none absolute h-3 w-3 text-white transition-opacity ${
                                  checked ? 'opacity-100' : 'opacity-0'
                                }`}
                              >
                                <path
                                  d="M5 13l4 4L19 7"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                            {v}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        {!filtersLoading && !specFilters && initialCategorySlug && (
          <div className="px-5 py-4 text-sm text-neutral-400">
            هیچ فیلتری برای این دسته موجود نیست
          </div>
        )}
      </div>

      {/* دکمهٔ اعمال فیلترها */}
      <div className="px-5 py-4">
        <button
          type="button"
          onClick={emit}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
        >
          اعمال فیلترها
        </button>
      </div>
    </div>
  );
}
