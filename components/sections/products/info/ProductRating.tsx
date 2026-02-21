// components/product/info/ProductRating.tsx
import { Star } from 'lucide-react';

export default function ProductRating({
  rating = 0,
  ratingCount = 0,
}: {
  rating?: number;
  ratingCount?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center text-yellow-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={18}
            fill={i < rating ? 'currentColor' : 'none'}
            stroke="currentColor"
          />
        ))}
      </div>

      <span className="text-sm text-gray-600 dark:text-gray-400">
        {rating.toFixed(1)} از ۵ ({ratingCount} نظر)
      </span>
    </div>
  );
}
