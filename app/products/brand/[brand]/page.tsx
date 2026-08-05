// app/product/brand/[brand]/page.tsx

import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { getFilteredProducts } from '@/services/products/db/queries';
import { SkeletonCard } from '@/components/ui/skeleton';
import BrandProductsClientPage from './BrandPageClient';
import BrandError from './BrandError';
import { getQueryClient } from '@/lib/query/query-client';
import { productKeys } from '@/hooks/useProducts';
import { parseSpecsFromURL } from '@/lib/url-helpers';
import { FiltersProduct } from '@/types/product';

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  params: Promise<{ brand: string }>;
  searchParams: Promise<SearchParams>;
};

export default async function BrandPage({ params, searchParams }: PageProps) {
  const { brand } = await params;
  const decodedBrand = decodeURIComponent(brand);

  const sp = await searchParams;
  const queryClient = getQueryClient();

  const urlSearchParams = new URLSearchParams();
  Object.entries(sp).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => urlSearchParams.append(key, v));
    } else if (value !== undefined) {
      urlSearchParams.set(key, value);
    }
  });

  const filters: Omit<FiltersProduct, 'page'> = {
    brandSlug: decodedBrand,
    categorySlug: typeof sp.categorySlug === 'string' ? sp.categorySlug : undefined,
    minPrice: typeof sp.minPrice === 'string' ? Number(sp.minPrice) : undefined,
    maxPrice: typeof sp.maxPrice === 'string' ? Number(sp.maxPrice) : undefined,
    sort: typeof sp.sort === 'string' ? (sp.sort as FiltersProduct['sort']) : 'new',
    q: typeof sp.q === 'string' ? sp.q : undefined,
    perPage: 20,
    specs: parseSpecsFromURL(urlSearchParams),
  };

  await queryClient.prefetchInfiniteQuery({
    queryKey: productKeys.infinite(filters),
    queryFn: ({ pageParam }) => getFilteredProducts({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
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
