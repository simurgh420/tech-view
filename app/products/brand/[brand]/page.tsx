// app/product/brand/page.tsx

import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { getProductsByBrand } from '@/services/products/db/queries';
import { SkeletonCard } from '@/components/ui/skeleton';
import BrandProductsClientPage from './BrandPageClient';
import BrandError from './BrandError';
import { getQueryClient } from '@/lib/query/query-client';

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const decodedBrand = decodeURIComponent(brand);

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['brand-products', decodedBrand],
    queryFn: () => getProductsByBrand(decodedBrand),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BrandError>
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
          <BrandProductsClientPage brand={decodedBrand} />
        </Suspense>
      </BrandError>
    </HydrationBoundary>
  );
}
