// components/product/ProductFilters.tsx
'use client';

import { useState } from 'react';

type Props = {
  onChange: (filters: {
    minPrice?: number;
    maxPrice?: number;
    brandSlug?: string;
    ram?: string[];
  }) => void;
};

export default function ProductFilters({ onChange }: Props) {
  const [price, setPrice] = useState<number>(0);
  const [brandSlug, setBrandSlug] = useState<string | undefined>(undefined);
  const [ram, setRam] = useState<string[]>([]);

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    setPrice(value);
    onChange({ minPrice: 0, maxPrice: value, brandSlug, ram });
  }

  function handleBrandChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setBrandSlug(value);
    onChange({ minPrice: 0, maxPrice: price, brandSlug: value, ram });
  }

  function handleRamChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const checked = e.target.checked;
    const newRam = checked ? [...ram, value] : ram.filter(r => r !== value);
    setRam(newRam);
    onChange({ minPrice: 0, maxPrice: price, brandSlug, ram: newRam });
  }

  return (
    <div className="p-4 rounded-lg shadow-sm space-y-6">
      <h3 className="font-bold text-lg">فیلترها</h3>

      {/* فیلتر قیمت */}
      <div>
        <label className="block text-sm font-medium mb-1">محدوده قیمت</label>
        <input
          type="range"
          min="0"
          max="50000000"
          value={price}
          onChange={handlePriceChange}
          className="w-full"
        />
        <div className="text-xs mt-1">تا {price.toLocaleString()} تومان</div>
      </div>

      {/* فیلتر برند (تک انتخابی) */}
      <div>
        <label className="block text-sm font-medium mb-1">برند</label>
        <ul className="space-y-1 text-sm">
          {['apple', 'Samsung', 'TM-D', 'Cypher'].map(b => (
            <li key={b}>
              <label className="flex items-center gap-2">
                <input
                  type="radio" // ✅ رادیو به جای چک‌باکس
                  name="brandSlug"
                  value={b}
                  checked={brandSlug === b}
                  onChange={handleBrandChange}
                />
                {b}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* فیلتر رم (چند انتخابی) */}
      <div>
        <label className="block text-sm font-medium mb-1">رم</label>
        <ul className="space-y-1 text-sm">
          {['4', '6', '8'].map(r => (
            <li key={r}>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={r}
                  checked={ram.includes(r)}
                  onChange={handleRamChange}
                />
                {r} گیگ
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
