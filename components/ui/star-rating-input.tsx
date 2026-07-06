// components/ui/star-rating-input.tsx
'use client';

import { Star, StarHalf } from 'lucide-react';
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
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label="امتیاز از 5 ستاره"
      className="flex w-fit items-center gap-1"
      dir="ltr"
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
            aria-label={`امتیاز ${star} از 5`}
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
  );
}

interface StarRatingDisplayProps {
  value: number;
  size?: number;
  /** نمایش متن عددی و تعداد نظرات کنار ستاره‌ها */
  showLabel?: boolean;
  /** تعداد کل نظرات - فقط وقتی showLabel فعاله استفاده می‌شه */
  count?: number;
  className?: string;
}

// نسخه‌ی فقط‌نمایشی برای کارت‌های ریویو/کامنت/صفحه‌ی محصول - با پشتیبانی نصفه‌ستاره
export function StarRatingDisplay({
  value,
  size = 16,
  showLabel = false,
  count,
  className,
}: StarRatingDisplayProps) {
  const safeValue = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  const fullStars = Math.floor(safeValue);
  const hasHalf = safeValue % 1 >= 0.25 && safeValue % 1 < 0.75;
  const hasNextFull = safeValue % 1 >= 0.75;

  // برای لیبل، عدد صحیح گردشده و اعداد انگلیسی (نه اعشاری، نه فارسی)
  const roundedValue = Math.round(safeValue);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-0.5" dir="ltr">
        {Array.from({ length: 5 }).map((_, i) => {
          const starNumber = i + 1;
          const isFull = starNumber <= fullStars || (hasNextFull && starNumber === fullStars + 1);
          const isHalf = !isFull && hasHalf && starNumber === fullStars + 1;

          if (isFull) {
            return <Star key={i} size={size} className="fill-amber-400 text-amber-400" />;
          }
          if (isHalf) {
            return <StarHalf key={i} size={size} className="fill-amber-400 text-amber-400" />;
          }
          return <Star key={i} size={size} className="fill-none text-muted-foreground/30" />;
        })}
      </div>

      {showLabel && (
        <span className="text-sm text-muted-foreground" dir="ltr">
          {roundedValue}/5{typeof count === 'number' ? ` (${count})` : ''}
        </span>
      )}
    </div>
  );
}
