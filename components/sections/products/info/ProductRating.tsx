// components/product/info/ProductRating.tsx
import { Star, StarHalf } from 'lucide-react';

export default function ProductRating({
  rating = 0,
  ratingCount = 0,
}: {
  rating?: number;
  ratingCount?: number;
}) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-2">
      {/* ستاره‌ها */}
      <div className="flex items-center text-yellow-500">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} size={18} fill="currentColor" stroke="currentColor" />;
          }
          if (i === fullStars && hasHalf) {
            return <StarHalf key={i} size={18} fill="currentColor" stroke="currentColor" />;
          }
          return <Star key={i} size={18} stroke="currentColor" />;
        })}
      </div>

      {/* متن */}
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {rating.toFixed(1)} از ۵ • {ratingCount} نظر
      </span>
    </div>
  );
}
