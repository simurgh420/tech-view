// app/product/brand/[brand]/page.tsx

import { Suspense } from 'react';
import BrandProductsClientPage from './BrandPageClient';
import { SkeletonCard } from '@/components/ui/skeleton';

export default async function ProductPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
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
      <BrandProductsClientPage brand={brand} />;
    </Suspense>
  );
}
