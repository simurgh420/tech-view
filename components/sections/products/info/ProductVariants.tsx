'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

type Props = {
  colors: { name: string; hex: string }[];
  variants: { ram: string; storage: string }[];
};

export default function ProductVariants({ colors, variants }: Props) {
  const [selectedColor, setSelectedColor] = useState(colors[0]?.hex ?? null);

  const [selectedVariant, setSelectedVariant] = useState(0);

  return (
    <div className="space-y-7">
      {/* رنگ‌ها */}
      {colors.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">رنگ:</h3>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {colors.find(c => c.hex === selectedColor)?.name}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {colors.map(color => {
              const active = selectedColor === color.hex;

              return (
                <button
                  key={color.hex}
                  type="button"
                  title={color.name}
                  onClick={() => setSelectedColor(color.hex)}
                  className={`
                    relative
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    transition-all
                    duration-200

                    ${
                      active
                        ? 'border-red-500 shadow-md shadow-red-500/20 scale-105'
                        : 'border-neutral-300 hover:border-neutral-400 dark:border-neutral-700'
                    }
                  `}
                >
                  <span
                    className="h-8 w-8 rounded-full border border-black/10 dark:border-white/10"
                    style={{ backgroundColor: color.hex }}
                  />

                  {active && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* نسخه‌ها */}
      {/* نسخه‌ها */}
      {variants.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">نسخه:</h3>

            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {variants[selectedVariant]
                ? `${variants[selectedVariant].ram} / ${variants[selectedVariant].storage}`
                : ''}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {variants.map((variant, index) => {
              const active = selectedVariant === index;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedVariant(index)}
                  className={`
              rounded-xl
              border
              px-3
              py-2
              text-sm
              font-medium
              transition-all
              duration-200

              ${
                active
                  ? `
                    border-red-500
                    bg-red-50
                    text-red-600
                    shadow-sm
                    dark:bg-red-500/10
                    dark:text-red-400
                  `
                  : `
                    border-neutral-300
                    bg-white
                    text-neutral-700
                    hover:border-neutral-400
                    hover:bg-neutral-50

                    dark:border-neutral-700
                    dark:bg-neutral-900
                    dark:text-neutral-300
                    dark:hover:bg-neutral-800
                  `
              }
            `}
                >
                  {variant.ram} / {variant.storage}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
