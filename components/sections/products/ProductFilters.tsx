'use client';

import { useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Button } from '@/components/ui';

type Filters = {
  minPrice?: number;
  maxPrice?: number;
  brandSlug?: string;
  ram?: string[];
};

type Props = {
  onChange: (filters: Filters) => void;
};

export default function ProductFilters({ onChange }: Props) {
  const PRICE_MIN = 0;
  const PRICE_MAX = 50_000_000;

  const [priceRange, setPriceRange] = useState<number[]>([PRICE_MIN, PRICE_MAX]);
  const [isPriceOpen, setIsPriceOpen] = useState(false);

  const [brandSlug, setBrandSlug] = useState<string>();
  const [ram, setRam] = useState<string[]>([]);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isRamOpen, setIsRamOpen] = useState(false);

  function emit(next: Partial<Filters>) {
    onChange({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      ...(brandSlug && { brandSlug }),
      ...(ram.length > 0 && { ram }),
      ...next,
    });
  }

  return (
    <div className="p-6 rounded-lg shadow-lg space-y-6">
      <h3 className="text-2xl font-semibold">فیلترها</h3>

      {/* قیمت - منوی کشویی */}
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
                  emit({ minPrice: value[0], maxPrice: value[1] });
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
                  transition: 'box-shadow 0.2s',
                },
                rail: { backgroundColor: '#e5e7eb', height: 6 },
              }}
            />
          </div>
        )}
      </div>

      {/* برند */}
      <div>
        <Button
          variant={'ghost'}
          onClick={() => setIsBrandOpen(p => !p)}
          className="w-full flex justify-between"
        >
          <span>برند</span>
          <span>{brandSlug ?? 'انتخاب نشده'}</span>
        </Button>
        {isBrandOpen && (
          <div className="mt-2 space-y-2" dir="rtl">
            {['apple', 'samsung', 'tm-d', 'cypher'].map(b => (
              <label key={b} className="block">
                <input
                  type="radio"
                  name="brand"
                  value={b}
                  checked={brandSlug === b}
                  onChange={e => {
                    setBrandSlug(e.target.value);
                    emit({ brandSlug: e.target.value });
                  }}
                />
                {b}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* رم */}
      <div>
        <Button
          variant={'ghost'}
          onClick={() => setIsRamOpen(p => !p)}
          className="w-full flex justify-between"
        >
          <span>رم</span>
          <span>{ram.length ? ram.join(', ') : 'انتخاب نشده'}</span>
        </Button>
        {isRamOpen && (
          <div className="mt-2 space-y-2" dir="rtl">
            {['4', '6', '8'].map(r => (
              <label key={r} className="block">
                <input
                  type="checkbox"
                  value={r}
                  checked={ram.includes(r)}
                  onChange={e => {
                    const value = e.target.value;
                    const checked = e.target.checked;
                    const nextRam = checked ? [...ram, value] : ram.filter(x => x !== value);
                    setRam(nextRam);
                    emit({ ram: nextRam });
                  }}
                />
                {r} گیگ
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
