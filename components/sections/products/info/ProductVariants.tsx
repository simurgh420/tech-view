// components/product/info/ProductVariants.tsx
'use client';

import { useState } from 'react';

export default function ProductVariants({
  colors,
  variants,
}: {
  colors: { name: string; hex: string }[];
  variants: { ram: string; storage: string }[];
}) {
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0].hex ?? null);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      {/* رنگ‌ها */}
      {colors.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">رنگ‌ها</h4>

          <div className="flex gap-3">
            {colors.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelectedColor(c.hex)}
                className={`
                  w-7 h-7 rounded-full border
                  transition
                  ${selectedColor === c.hex ? 'ring-2 ring-blue-500' : ''}
                `}
                style={{ ['--color' as any]: c.hex }}
                title={c.name}
              >
                <span
                  className="block w-full h-full rounded-full"
                  style={{ backgroundColor: `var(--color)` }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* نسخه‌ها */}
      {variants.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">نسخه‌ها</h4>

          <div className="flex gap-3 flex-wrap">
            {variants.map((v, i) => (
              <button
                key={i}
                onClick={() => setSelectedVariant(i)}
                className={`
                  px-3 py-1 border rounded-lg text-sm transition
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  ${selectedVariant === i ? 'bg-gray-200 dark:bg-gray-700 font-medium' : ''}
                `}
              >
                {v.ram} / {v.storage}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
