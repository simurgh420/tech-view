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
  const [isBrandOpen, setIsBrandOpen] = useState<boolean>(false);
  const [isRamOpen, setIsRamOpen] = useState<boolean>(false);

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
    <div className="p-6  rounded-lg shadow-lg space-y-6">
      <h3 className="text-2xl font-semibold ">فیلترها</h3>

      {/* فیلتر قیمت */}
      <div>
        <label className="block text-sm font-medium mb-2 ">محدوده قیمت</label>
        <input
          type="range"
          min="0"
          max="50000000"
          value={price}
          onChange={handlePriceChange}
          className="w-full h-2  rounded-lg"
        />
        <div className="text-sm mt-2">تا {price.toLocaleString()} تومان</div>
      </div>

      {/* فیلتر برند (کشویی) */}
      <div>
        <button
          type="button"
          onClick={() => setIsBrandOpen(!isBrandOpen)}
          className="w-full text-left px-4 py-2  rounded-lg flex justify-between items-center "
        >
          <span className="text-sm">برند</span>
          <span>{brandSlug || 'انتخاب نشده'}</span>
        </button>
        {isBrandOpen && (
          <div className="space-y-2 mt-2">
            {['apple', 'Samsung', 'TM-D', 'Cypher'].map(b => (
              <label key={b} className="block text-sm ">
                <input
                  type="radio"
                  name="brandSlug"
                  value={b}
                  checked={brandSlug === b}
                  onChange={handleBrandChange}
                  className="mr-2"
                />
                {b}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* فیلتر رم (چند انتخابی) */}
      <div>
        <button
          type="button"
          onClick={() => setIsRamOpen(!isRamOpen)}
          className="w-full text-left px-4 py-2  rounded-lg flex justify-between items-center"
        >
          <span className="text-sm">رم</span>
          <span>{ram.length > 0 ? ram.join(', ') : 'انتخاب نشده'}</span>
        </button>
        {isRamOpen && (
          <div className="space-y-2 mt-2">
            {['4', '6', '8'].map(r => (
              <label key={r} className="block text-sm ">
                <input
                  type="checkbox"
                  value={r}
                  checked={ram.includes(r)}
                  onChange={handleRamChange}
                  className="mr-2"
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
