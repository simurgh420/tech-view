// components/product/info/ProductInfo.tsx
'use client';

import ProductTitle from './ProductTitle';
import ProductRating from './ProductRating';
import ProductKeyFeatures from './ProductKeyFeatures';
import ProductVariants from './ProductVariants';

type Props = {
  title: string;
  brand: string;

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

  keyFeatures = [],
  colors = [],
  variants = [],
}: Props) {
  return (
    <div dir="rtl" className="space-y-6">
      <ProductTitle title={title} brand={brand} />

      <ProductRating rating={rating} ratingCount={ratingCount} />

      <ProductKeyFeatures features={keyFeatures} />

      <ProductVariants colors={colors} variants={variants} />
    </div>
  );
}
