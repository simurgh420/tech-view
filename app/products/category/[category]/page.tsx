// app/product/category/page.tsx

import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { getProductsByCategory } from '@/services/products/db/queries';
import { SkeletonCard } from '@/components/ui/skeleton';
import CategoryProductsClientPage from './categoryPageClient';
import CategoryError from './CategoryError';
import { getQueryClient } from '@/lib/query/query-client';

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['category-products', decodedCategory],
    queryFn: () => getProductsByCategory(decodedCategory),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoryError>
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
          <CategoryProductsClientPage category={decodedCategory} />
        </Suspense>
      </CategoryError>
    </HydrationBoundary>
  );
}
