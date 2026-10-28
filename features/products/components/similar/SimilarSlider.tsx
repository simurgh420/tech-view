// components/product/similar/SimilarSlider.tsx

'use client';

import SimilarCard from './SimilarCard';

type Product = {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
};

type Props = {
  products: Product[];
};

export default function SimilarSlider({ products }: Props) {
  return (
    <div
      className="
        flex
        gap-4

        overflow-x-auto

        snap-x
        snap-mandatory

        pb-2

        scrollbar-hide
      "
    >
      {products.map(product => (
        <div
          key={product.id}
          className="
            snap-start

            shrink-0

            w-50

            sm:w-55
          "
        >
          <SimilarCard product={product} />
        </div>
      ))}
    </div>
  );
}
