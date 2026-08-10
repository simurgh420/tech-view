import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';

import { StarRatingDisplay } from '@/components/ui/star-rating-input';
import { formatPrice } from '@/lib/formatPrice';
import { HomeProduct } from '@/services/products/productIncludes';

type Props = {
  product: HomeProduct;
};

export default function HomeProductCard({ product }: Props) {
  const rating = Number(product.rating) || 0;

  const price = product.price.toString();
  const discountPrice = product.discountPrice?.toString() ?? null;
  const discountPercentage = Number(product.discountPercentage) || 0;
  const hasDiscount =
    product.isDiscounted &&
    product.discountPrice !== null &&
    Number(product.discountPrice) < Number(product.price);
  return (
    <Link
      href={`/products/${product.slug}`}
      dir="rtl"
      className="
  group
  relative
  flex
  h-full
  flex-col
  overflow-hidden
  rounded-2xl
  border
  border-border
  transition-[transform,box-shadow,border-color]
  duration-500
  ease-[cubic-bezier(0.22,1,0.36,1)]
  hover:-translate-y-1
  hover:border-primary/30
  hover:shadow-xl
  hover:shadow-primary/5
"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted/20">
        <Image
          src={product.thumbnail || '/placeholder.jpg'}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
          className="
  object-contain
  p-5
  transition-transform
  duration-700
  ease-[cubic-bezier(0.22,1,0.36,1)]
  group-hover:scale-[1.06]
"
        />

        {/* Discount */}
        {hasDiscount && discountPercentage > 0 && (
          <span
            className="
      absolute
      start-3
      top-3
      rounded-full
      bg-destructive
      px-2.5
      py-1
      text-[11px]
      font-bold
      text-destructive-foreground
    "
          >
            {discountPercentage}٪
          </span>
        )}
        {/* Hover action */}
        <div
          className="
    pointer-events-none
    absolute
    inset-x-4
    bottom-4
    translate-y-3
    opacity-0
    transition-all
    duration-500
    ease-[cubic-bezier(0.22,1,0.36,1)]
    group-hover:translate-y-0
    group-hover:opacity-100
  "
        >
          <div
            className="
      rounded-xl
      bg-background/95
      px-4
      py-2.5
      text-center
      text-xs
      font-semibold
      text-foreground
      shadow-lg
      shadow-black/5
      backdrop-blur-md
      transition-all
      duration-300
      group-hover:bg-primary
      group-hover:text-primary-foreground
    "
          >
            مشاهده محصول
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {/* Title */}
        <h2
          className="
            line-clamp-2
            min-h-10
            text-sm
            font-medium
            leading-5
            text-foreground
          transition-colors
           duration-500
           roup-hover:text-primary
          "
        >
          {product.title}
        </h2>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRatingDisplay value={rating} size={13} />

            {product.reviewCount > 0 && (
              <span className="text-[11px] text-muted-foreground">({product.reviewCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span
            className="
              text-base
              font-bold
              tracking-tight
              text-foreground
            "
          >
            {formatPrice(hasDiscount ? (discountPrice ?? price) : price)}
          </span>

          {hasDiscount && (
            <span
              className="
                text-xs
                text-muted-foreground
                line-through
              "
            >
              {formatPrice(price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
