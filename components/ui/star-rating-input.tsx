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

  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 5);
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
      aria-label="امتیاز از ۵ ستاره"
      dir="ltr"
      className="flex w-fit items-center gap-1"
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
  showLabel?: boolean;
  count?: number;
  className?: string;
}

export function StarRatingDisplay({
  value,
  size = 16,
  showLabel = false,
  count,
  className,
}: StarRatingDisplayProps) {
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 5);

  const fullStars = Math.floor(safeValue);
  const decimal = safeValue - fullStars;

  const hasHalf = decimal >= 0.25 && decimal < 0.75;
  const hasNextFull = decimal >= 0.75;

  const label = Number.isInteger(safeValue) ? safeValue.toString() : safeValue.toFixed(1);

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5" dir="ltr">
        {Array.from({ length: 5 }).map((_, index) => {
          const starNumber = index + 1;

          const isFull = starNumber <= fullStars || (hasNextFull && starNumber === fullStars + 1);

          const isHalf = !isFull && hasHalf && starNumber === fullStars + 1;

          if (isFull) {
            return <Star key={starNumber} size={size} className="fill-amber-400 text-amber-400" />;
          }

          if (isHalf) {
            return (
              <StarHalf key={starNumber} size={size} className="fill-amber-400 text-amber-400" />
            );
          }

          return (
            <Star key={starNumber} size={size} className="fill-none text-muted-foreground/30" />
          );
        })}
      </div>

      {showLabel && (
        <span dir="ltr" className="whitespace-nowrap text-sm font-medium text-muted-foreground">
          {label}/5
          {typeof count === 'number' && <span className="ml-1.5">({count})</span>}
        </span>
      )}
    </div>
  );
}
