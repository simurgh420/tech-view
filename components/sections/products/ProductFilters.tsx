'use client';

import { useState } from 'react';

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
  const [price, setPrice] = useState<number>(0);
  const [brandSlug, setBrandSlug] = useState<string>();
  const [ram, setRam] = useState<string[]>([]);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isRamOpen, setIsRamOpen] = useState(false);

  function emit(next: Partial<Filters>) {
    onChange({
      ...(price > 0 && { maxPrice: price }),
      ...(brandSlug && { brandSlug }),
      ...(ram.length > 0 && { ram }),
      ...next,
    });
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    setPrice(value);
    emit({ maxPrice: value });
  }

  function handleBrandChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBrandSlug(e.target.value);
    emit({ brandSlug: e.target.value });
  }

  function handleRamChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const checked = e.target.checked;

    const nextRam = checked ? [...ram, value] : ram.filter(r => r !== value);

    setRam(nextRam);
    emit({ ram: nextRam });
  }

  return (
    <div className="p-6 rounded-lg shadow-lg space-y-6">
      <h3 className="text-2xl font-semibold">فیلترها</h3>

      {/* قیمت */}
      <div>
        <label className="block text-sm mb-2">محدوده قیمت</label>
        <input
          type="range"
          min="0"
          max="50000000"
          value={price}
          onChange={handlePriceChange}
          className="w-full"
        />
        <div className="text-sm mt-2">تا {price.toLocaleString()} تومان</div>
      </div>

      {/* برند */}
      <div>
        <button onClick={() => setIsBrandOpen(p => !p)} className="w-full flex justify-between">
          <span>برند</span>
          <span>{brandSlug ?? 'انتخاب نشده'}</span>
        </button>

        {isBrandOpen && (
          <div className="mt-2 space-y-2">
            {['apple', 'samsung', 'tm-d', 'cypher'].map(b => (
              <label key={b} className="block">
                <input
                  type="radio"
                  name="brand"
                  value={b}
                  checked={brandSlug === b}
                  onChange={handleBrandChange}
                />
                {b}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* رم */}
      <div>
        <button onClick={() => setIsRamOpen(p => !p)} className="w-full flex justify-between">
          <span>رم</span>
          <span>{ram.length ? ram.join(', ') : 'انتخاب نشده'}</span>
        </button>

        {isRamOpen && (
          <div className="mt-2 space-y-2">
            {['4', '6', '8'].map(r => (
              <label key={r} className="block">
                <input
                  type="checkbox"
                  value={r}
                  checked={ram.includes(r)}
                  onChange={handleRamChange}
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
