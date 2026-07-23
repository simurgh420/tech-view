// components/product/similar/ProductSimilar.tsx

'use client';

import SimilarSlider from './SimilarSlider';

type Product = {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
};

type Props = {
  products?: Product[];
};

// بعدا باید اضافه شود

export default function ProductSimilar({ products = [] }: Props) {
  if (!products.length) {
    return null;
  }

  return (
    <section
      className="
        mt-12
        space-y-4
      "
    >
      <h2
        className="
          text-xl
          font-bold

          text-gray-900
          dark:text-gray-100
        "
      >
        محصولات مشابه
      </h2>

      <SimilarSlider products={products} />
    </section>
  );
}
