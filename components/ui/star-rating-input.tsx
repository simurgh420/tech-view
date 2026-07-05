// components/ui/star-rating-input.tsx
'use client';

import { Star } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  disabled?: boolean;
}

export function StarRatingInput({ value, onChange, size = 26, disabled }: StarRatingInputProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  // اطمینان از عددی بودن value حتی اگر undefined/NaN از فرم برسه
  const safeValue = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  const display = hover ?? safeValue;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (disabled || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.min(Math.max(x / rect.width, 0), 1);
    const starIndex = Math.min(5, Math.max(1, Math.ceil(ratio * 5)));
    setHover(starIndex);
  }

  return (
    <div className="flex items-center gap-3" dir="ltr">
      <div
        ref={containerRef}
        role="radiogroup"
        aria-label="امتیاز از ۵ ستاره"
        className="flex items-center gap-1"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => !disabled && setHover(null)}
      >
        {[1, 2, 3, 4, 5].map(star => {
          const isFilled = star <= display;
          const isActiveHover = hover === star;

          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              role="radio"
              aria-checked={star === safeValue}
              aria-label={`امتیاز ${star} از ۵`}
              onClick={() => onChange(star)}
              className={cn(
                'rounded-sm p-0.5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                !disabled && 'cursor-pointer',
                isActiveHover && 'scale-125'
              )}
            >
              <Star
                size={size}
                className={cn(
                  'transition-colors',
                  isFilled ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/60'
                )}
              />
            </button>
          );
        })}
      </div>

      <span className="min-w-6 text-sm font-medium text-muted-foreground" dir="rtl">
        {display > 0 ? `${display}/۵` : ''}
      </span>
    </div>
  );
}

export function StarRatingDisplay({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={size}
          className={cn(
            star <= value ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}
