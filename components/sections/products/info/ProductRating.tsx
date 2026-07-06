import { StarRatingDisplay } from '@/components/ui/star-rating-input';

export default function ProductRating({
  rating = 0,
  ratingCount = 0,
}: {
  rating?: number;
  ratingCount?: number;
}) {
  return <StarRatingDisplay value={rating} size={18} showLabel count={ratingCount} />;
}
