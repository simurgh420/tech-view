// components/product/info/ProductInfo.tsx
'use client';

import ProductTitle from './ProductTitle';
import ProductRating from './ProductRating';
import ProductKeyFeatures from './ProductKeyFeatures';
import ProductVariants from './ProductVariants';

type Props = {
  title: string;
  brand: string;
  model?: string;
  rating?: number;
  ratingCount?: number;
  shortDescription?: string;
  keyFeatures?: string[];
  colors?: { name: string; hex: string }[];
  variants?: { ram: string; storage: string }[];
};

export default function ProductInfo({
  title,
  brand,
  model,
  rating,
  ratingCount,
  shortDescription,
  keyFeatures = [],
  colors = [],
  variants = [],
}: Props) {
  return (
    <div className="space-y-6">
      <ProductTitle title={title} brand={brand} model={model} />

      <ProductRating rating={rating} ratingCount={ratingCount} />

      {shortDescription && (
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{shortDescription}</p>
      )}

      <ProductKeyFeatures features={keyFeatures} />

      <ProductVariants colors={colors} variants={variants} />
    </div>
  );
}
