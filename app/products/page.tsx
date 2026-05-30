// app/products/page.tsx

import { Suspense } from 'react';
import ProductsPageClient from './ProductsPageClient';
import { SkeletonCard } from '@/components/ui/skeleton';

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ProductsPageClient />
    </Suspense>
  );
}
