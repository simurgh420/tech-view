'use client';

import { useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Button } from '@/components/ui';
import { useProducts } from '@/hooks/useProducts';
import type { FiltersProduct } from '@/types/product';

type Props = {
  onChange: (filters: Partial<FiltersProduct>) => void;
  initialCategorySlug?: string;
};

export default function ProductFilters({ onChange, initialCategorySlug }: Props) {
  const PRICE_MIN = 0;
  const PRICE_MAX = 50_000_000;

  const [priceRange, setPriceRange] = useState<number[]>([PRICE_MIN, PRICE_MAX]);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});

  // استفاده از هوک جدید
  const { useProductFilters } = useProducts();
  const { data: specFilters, isLoading: filtersLoading } = useProductFilters(
    initialCategorySlug ?? ''
  );

  function emit() {
    onChange({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      ...(Object.keys(selectedSpecs).length > 0 && { specs: selectedSpecs }),
    });
  }

  const handleSpecChange = (key: string, value: string) => {
    const newSpecs = { ...selectedSpecs };
    if (newSpecs[key] === value) {
      delete newSpecs[key];
    } else {
      newSpecs[key] = value;
    }
    setSelectedSpecs(newSpecs);
    onChange({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      ...(Object.keys(newSpecs).length > 0 && { specs: newSpecs }),
    });
  };

  return (
    <div className="p-6 rounded-lg shadow-lg space-y-6">
      <h3 className="text-2xl font-semibold">فیلترها</h3>

      {/* محدوده قیمت */}
      <div>
        <Button
          onClick={() => setIsPriceOpen(p => !p)}
          className="w-full flex justify-between items-center"
          variant={'outline'}
        >
          <span>محدوده قیمت</span>
          <span>
            {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} تومان
          </span>
        </Button>
        {isPriceOpen && (
          <div className="mt-3 px-2">
            <Slider
              range
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={1000}
              value={priceRange}
              onChange={value => {
                if (Array.isArray(value)) setPriceRange(value);
              }}
              onChangeComplete={value => {
                if (Array.isArray(value)) {
                  setPriceRange(value);
                  emit();
                }
              }}
              styles={{
                track: { backgroundColor: '#8a041a', height: 6 },
                handle: {
                  borderColor: '#3b82f6',
                  backgroundColor: '#fff',
                  width: 18,
                  height: 18,
                  marginTop: -7,
                  boxShadow: '0 0 0 4px rgba(59,130,246,0.3)',
                },
                rail: { backgroundColor: '#e5e7eb', height: 6 },
              }}
            />
          </div>
        )}
      </div>

      {/* فیلترهای پویا (مشخصات فنی) */}
      {filtersLoading && <div className="text-sm text-gray-500">در حال بارگذاری فیلترها...</div>}

      {specFilters && Object.keys(specFilters).length > 0 && (
        <div className="space-y-4">
          {Object.entries(specFilters).map(([key, values]) => (
            <div key={key}>
              <h4 className="font-medium mb-2 text-sm">{key}</h4>
              <div className="space-y-1">
                {values.map(v => (
                  <label key={v} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedSpecs[key] === v}
                      onChange={() => handleSpecChange(key, v)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    {v}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!filtersLoading && !specFilters && initialCategorySlug && (
        <div className="text-sm text-gray-500">هیچ فیلتری برای این دسته موجود نیست</div>
      )}
    </div>
  );
}
