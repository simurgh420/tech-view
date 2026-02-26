'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';

import SortMenu from '@/components/sections/products/SortMenu';
import ProductCard from '@/components/sections/products/ProductCard';
import ProductFilters from '@/components/sections/products/ProductFilters';
import { Button } from '@/components/ui';

import type { FiltersState } from '@/types/product';

export default function CategoryProductsPage() {
  const { category } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { useGetFilteredProducts } = useProducts();

  const initialFilters: FiltersState = {
    categorySlug: category as string,
    brandSlug: searchParams.get('brandSlug') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    ram: searchParams.get('ram') ? searchParams.get('ram')!.split(',') : [],
    sort: searchParams.get('sort') || 'new',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    perPage: 20,
  };

  const [filters, setFilters] = useState<FiltersState>(initialFilters);

  function buildQueryString(filters: FiltersState) {
    const params = new URLSearchParams();
    const excludedKeys = ['page', 'perPage'];
    Object.entries(filters).forEach(([key, value]) => {
      if (excludedKeys.includes(key)) return;
      if (value === undefined || value === null) return;
      if (Array.isArray(value) && value.length === 0) return;

      params.set(key, Array.isArray(value) ? value.join(',') : String(value));
    });

    return params.toString();
  }

  function syncUrl(updated: FiltersState) {
    const query = buildQueryString(updated);
    router.replace(`?${query}`);
  }

  function handleSortChange(sort: string) {
    const updated = { ...filters, sort, page: 1 };
    setFilters(updated);
    syncUrl(updated);
  }

  function handleFiltersChange(newFilters: Partial<FiltersState>) {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    syncUrl(updated);
  }

  function handlePageChange(nextPage: number) {
    const updated = { ...filters, page: nextPage };
    setFilters(updated);
    syncUrl(updated);
  }

  const { data: products, isLoading, error } = useGetFilteredProducts(filters);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Product List */}
        <section className="col-span-12 lg:col-span-9">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">دسته: {category}</h1>
            <SortMenu value={filters.sort ?? 'new'} onChange={handleSortChange} />
          </div>

          {error && <div className="text-red-500">خطا در بارگذاری</div>}

          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: filters.perPage ?? 20 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg" />
              ))}
            </div>
          )}

          {!isLoading && products?.length ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange(filters.page! - 1)}
                >
                  قبلی
                </Button>
                <Button variant="outline" onClick={() => handlePageChange(filters.page! + 1)}>
                  بعدی
                </Button>
              </div>
            </>
          ) : (
            !isLoading && <div className="text-gray-500">محصولی یافت نشد</div>
          )}
        </section>

        {/* Sidebar Filters */}
        <aside className="col-span-12 lg:col-span-3">
          <ProductFilters onChange={handleFiltersChange} />
        </aside>
      </div>
    </div>
  );
}
