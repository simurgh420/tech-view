// app/products/page.tsx

import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { SkeletonCard } from '@/components/ui/skeleton';
import ProductsPageClient from './ProductsPageClient';
import ProductsError from './ProductsError';

import { fetchFilteredProductsApi } from '@/services/products/api/queries';
import { parseSpecsFromURL } from '@/lib/url-helpers';
import { FiltersProduct } from '@/types/product';
import { getQueryClient } from '@/lib/query/query-client';

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const queryClient = getQueryClient();

  const urlSearchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => urlSearchParams.append(key, v));
    } else if (value !== undefined) {
      urlSearchParams.set(key, value);
    }
  });

  const filters: FiltersProduct = {
    brandSlug: typeof params.brandSlug === 'string' ? params.brandSlug : undefined,

    categorySlug: typeof params.categorySlug === 'string' ? params.categorySlug : undefined,

    minPrice: typeof params.minPrice === 'string' ? Number(params.minPrice) : undefined,

    maxPrice: typeof params.maxPrice === 'string' ? Number(params.maxPrice) : undefined,

    sort: typeof params.sort === 'string' ? (params.sort as FiltersProduct['sort']) : 'new',

    q: typeof params.q === 'string' ? params.q : undefined,

    page: typeof params.page === 'string' ? Number(params.page) : 1,

    perPage: 20,

    specs: parseSpecsFromURL(urlSearchParams),
  };

  await queryClient.prefetchQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchFilteredProductsApi(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsError>
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
      </ProductsError>
    </HydrationBoundary>
  );
}
