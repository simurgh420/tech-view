'use client';

import { ProductEmptyState } from '@/components/sections/products/empty-state';
import ProductCard from '@/components/sections/products/ProductCard';
import ProductFiltersResponsive from '@/components/sections/products/ProductFiltersResponsive';
import SortMenu from '@/components/sections/products/SortMenu';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useInfiniteProductsPage } from '@/hooks/useInfiniteProductsPage';

type BrandProductsPageProps = {
  brand: string;
};

export default function BrandProductsClientPage({ brand }: BrandProductsPageProps) {
  const {
    filters,
    products,
    sentinelRef,
    updateSort,
    updateFilters,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProductsPage({ brandSlug: brand });
  const activeFilterCount =
    (filters.specs ? Object.keys(filters.specs).length : 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0);
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

  if (error) return <ProductEmptyState variant="error" />;
  if (!products.length) return <ProductEmptyState variant="empty" />;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-9">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">{brand}</h1>
            <SortMenu value={filters.sort ?? 'new'} onChange={updateSort} />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div ref={sentinelRef} className="h-10 w-full" />

          {isFetchingNextPage && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={`loading-${i}`} />
              ))}
            </div>
          )}

          {!hasNextPage && products.length > 0 && (
            <p className="text-center text-sm text-neutral-400 mt-8">
              محصول دیگری برای نمایش وجود ندارد
            </p>
          )}
        </section>

        <aside className="col-span-12 lg:col-span-3 mt-6 lg:mt-0">
          <ProductFiltersResponsive
            onChange={updateFilters}
            initialCategorySlug={filters.categorySlug}
            activeFilterCount={activeFilterCount}
          />
        </aside>
      </div>
    </div>
  );
}
