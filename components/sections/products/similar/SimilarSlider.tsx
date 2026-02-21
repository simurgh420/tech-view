// components/product/similar/SimilarSlider.tsx
'use client';

import SimilarCard from './SimilarCard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SimilarSlider({ products }: { products: any[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
      {products.map(product => (
        <div key={product.id} className="snap-start min-w-200px">
          <SimilarCard product={product} />
        </div>
      ))}
    </div>
  );
}
