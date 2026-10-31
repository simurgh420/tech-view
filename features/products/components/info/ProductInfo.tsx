'use client';

import ProductKeyFeatures from './ProductKeyFeatures';
import ProductRating from './ProductRating';
import ProductTitle from './ProductTitle';
import ProductVariants from './ProductVariants';

type Props = {
  title: string;
  brand: string;
  brandSlug?: string;
  rating?: number;
  ratingCount?: number;
  keyFeatures?: string[];
  colors?: { name: string; hex: string }[];
  variants?: { ram: string; storage: string }[];
};

export default function ProductInfo({
  title,
  brand,
  rating,
  ratingCount,
  brandSlug,
  keyFeatures = [],
  colors = [],
  variants = [],
}: Props) {
  return (
    <section
      dir="rtl"
      className="
        flex
        flex-col
        gap-7
      "
    >
      <ProductTitle title={title} brand={brand} brandSlug={brandSlug} />

      <div
        className="
          border-b
          border-neutral-200/70
          pb-5
          dark:border-neutral-800/70
        "
      >
        <ProductRating rating={rating} ratingCount={ratingCount} />
      </div>

      <ProductKeyFeatures features={keyFeatures} />

      <ProductVariants colors={colors} variants={variants} />
    </section>
  );
}
