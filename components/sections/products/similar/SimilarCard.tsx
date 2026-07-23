// components/product/similar/SimilarCard.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';

type Product = {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
};

const formatPrice = (value: number) => new Intl.NumberFormat('en-US').format(value);

export default function SimilarCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="
        block

        border
        rounded-xl

        p-3

        bg-white
        dark:bg-gray-900

        shadow-sm
        hover:shadow-md

        transition
      "
    >
      {/* Image */}
      <div
        className="
          relative
          w-full
          h-40

          mb-3

          rounded-lg
          overflow-hidden

          bg-gray-50
          dark:bg-gray-800
        "
      >
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes="
            (max-width:768px) 50vw,
            250px
          "
          className="
            object-contain
          "
        />
      </div>

      {/* Title */}
      <h3
        className="
          text-sm
          font-medium

          text-gray-800
          dark:text-gray-200

          line-clamp-2
        "
      >
        {product.title}
      </h3>

      {/* Price */}
      <div
        className="
          mt-2

          text-blue-600
          dark:text-blue-400

          font-semibold
        "
      >
        {formatPrice(product.price)} تومان
      </div>
    </Link>
  );
}
