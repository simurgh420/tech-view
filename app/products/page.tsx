// app/products/page.tsx
'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import SortMenu from '@/components/sections/products/SortMenu';
import ProductCard from '@/components/sections/products/ProductCard';
import ProductFilters from '@/components/sections/products/ProductFilters';
import { Button } from '@/components/ui';
import { FiltersProduct } from '@/types/product';

export default function ProductsPage() {
  const { useGetFilteredProducts } = useProducts();

  const [filters, setFilters] = useState<FiltersProduct>({
    sort: 'new',
    page: 1,
    perPage: 20,
  });

  const { data: products, isLoading, error } = useGetFilteredProducts(filters);

  function handleSortChange(sort: string) {
    setFilters(prev => ({ ...prev, sort: sort as FiltersProduct['sort'], page: 1 }));
  }

  function handleFiltersChange(newFilters: Partial<FiltersProduct>) {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }

  function handlePageChange(nextPage: number) {
    setFilters(prev => ({ ...prev, page: nextPage }));
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Product List */}
        <section className="col-span-12 lg:col-span-9">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">محصولات</h1>
            <SortMenu value={filters.sort ?? 'new'} onChange={handleSortChange} />
          </div>

          {/* Error Handling */}
          {error && (
            <div className="text-center py-10 text-red-500">خطا در بارگذاری محصولات ❌</div>
          )}

          {/* Loading State */}
          {isLoading && !error && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: filters.perPage ?? 20 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Products */}
          {!isLoading && !error && products?.length ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-6">
                <Button
                  variant={'outline'}
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange((filters.page ?? 1) - 1)}
                  className="px-4 py-2 mx-1 rounded  disabled:opacity-50"
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
            </>
          ) : (
            !isLoading &&
            !error && (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                محصولی یافت نشد ❌
              </div>
            )
          )}
        </section>

        {/* Sidebar Filters */}
        <aside className="col-span-12 lg:col-span-3 mt-6 lg:mt-0">
          <ProductFilters onChange={handleFiltersChange} />
        </aside>
      </div>
    </div>
  );
}
