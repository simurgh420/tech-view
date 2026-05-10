// app/products/ProductsPageClient.tsx

'use client';

import { ProductEmptyState } from '@/components/sections/products/empty-state';
import ProductCard from '@/components/sections/products/ProductCard';
import ProductFilters from '@/components/sections/products/ProductFilters';
import SortMenu from '@/components/sections/products/SortMenu';
import { Button } from '@/components/ui';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/useProducts';
import { buildFiltersQueryString, parseSpecsFromURL } from '@/lib/url-helpers';
import { FiltersProduct } from '@/types/product';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { useGetFilteredProducts } = useProducts();

  const initialFilters: FiltersProduct = {
    brandSlug: searchParams.get('brandSlug') || undefined,
    categorySlug: searchParams.get('categorySlug') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sort: (searchParams.get('sort') as FiltersProduct['sort']) || 'new',
    q: searchParams.get('q') || undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    perPage: 20,
    specs: parseSpecsFromURL(searchParams),
  };
  const [filters, setFilters] = useState<FiltersProduct>(initialFilters);
  const { data: products, isLoading, error } = useGetFilteredProducts(filters);

  useEffect(() => {
    const query = buildFiltersQueryString(filters);
    router.replace(query ? `?${query}` : window.location.pathname, { scroll: false });
  }, [filters, router]);

  function handleSortChange(sort: string) {
    setFilters(prev => ({ ...prev, sort: sort as FiltersProduct['sort'], page: 1 }));
  }

  function handleFiltersChange(newFilters: Partial<FiltersProduct>) {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }

  function handlePageChange(nextPage: number) {
    setFilters(prev => ({ ...prev, page: nextPage }));
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ProductEmptyState variant="error" />;
  }

  if (!products?.length) {
    return <ProductEmptyState variant="empty" />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-9">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">محصولات</h1>
            <SortMenu value={filters.sort ?? 'new'} onChange={handleSortChange} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <Button
              variant={'outline'}
              disabled={filters.page === 1}
              onClick={() => handlePageChange((filters.page ?? 1) - 1)}
              className="px-4 py-2 mx-1 rounded disabled:opacity-50"
            >
              قبلی
            </Button>
            <Button
              variant={'outline'}
              onClick={() => handlePageChange((filters.page ?? 1) + 1)}
              className="px-4 py-2 mx-1 rounded disabled:opacity-50"
            >
              بعدی
            </Button>
          </div>
        </section>

        <aside className="col-span-12 lg:col-span-3 mt-6 lg:mt-0">
          <ProductFilters
            onChange={handleFiltersChange}
            initialCategorySlug={filters.categorySlug}
          />
        </aside>
      </div>
    </div>
  );
}
