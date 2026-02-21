// components/product/similar/SimilarCard.tsx
'use client';

import Image from 'next/image';

const formatPrice = (value: number) => new Intl.NumberFormat('en-US').format(value);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SimilarCard({ product }: { product: any }) {
  return (
    <div className="border rounded-xl p-3 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition cursor-pointer">
      <div className="relative w-full h-40 mb-3">
        <Image src={product.thumbnail} alt={product.title} fill className="object-contain" />
      </div>

      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
        {product.title}
      </h3>

      <div className="mt-2 text-blue-600 font-semibold">{formatPrice(product.price)} تومان</div>
    </div>
  );
}
