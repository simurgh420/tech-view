'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';

import SortMenu from '@/components/sections/products/SortMenu';
import ProductCard from '@/components/sections/products/ProductCard';
import ProductFilters from '@/components/sections/products/ProductFilters';
import { Button } from '@/components/ui';
import { FiltersProduct } from '@/types/product';

type BrandProductsPageProps = {
  brand: string;
};

export default function BrandProductsClientPage({ brand }: BrandProductsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { useGetFilteredProducts } = useProducts();

  // تبدیل URL → فیلترها
  const initialFilters: FiltersProduct = {
    brandSlug: brand as string,
    categorySlug: searchParams.get('categorySlug') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sort: (searchParams.get('sort') as FiltersProduct['sort']) || 'new',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    perPage: 20,
  };

  const [filters, setFilters] = useState<FiltersProduct>(initialFilters);

  function buildQueryString(f: FiltersProduct) {
    const params = new URLSearchParams();
    if (f.categorySlug) params.set('categorySlug', f.categorySlug);
    if (f.minPrice) params.set('minPrice', String(f.minPrice));
    if (f.maxPrice) params.set('maxPrice', String(f.maxPrice));
    if (f.sort && f.sort !== 'new') params.set('sort', f.sort);
    return params.toString();
  }

  // Sync فیلترها با URL
  function syncUrl(updated: FiltersProduct) {
    const query = buildQueryString(updated);
    router.replace(`?${query}`);
  }

  // تغییر Sort
  function handleSortChange(sort: string) {
    const updated = { ...filters, sort: sort as FiltersProduct['sort'], page: 1 };
    setFilters(updated);
    syncUrl(updated);
  }

  // تغییر فیلترها
  function handleFiltersChange(newFilters: Partial<FiltersProduct>) {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    syncUrl(updated);
  }

  // تغییر صفحه
  function handlePageChange(nextPage: number) {
    const updated = { ...filters, page: nextPage };
    setFilters(updated);
    syncUrl(updated);
  }

  const { data: products, isLoading, error } = useGetFilteredProducts(filters);

  if (isLoading) {
    return <p className="p-10 text-center">در حال بارگذاری...</p>;
  }

  if (error) {
    return <p className="p-10 text-center text-red-500">خطا در بارگذاری محصولات ❌</p>;
  }

  if (!products?.length) {
    return <p className="p-10 text-center text-gray-500">محصولی یافت نشد ❌</p>;
  }
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Product List */}
        <section className="col-span-12 lg:col-span-9">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">برند: {brand}</h1>
            <SortMenu value={filters.sort ?? 'new'} onChange={handleSortChange} />
          </div>

          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: filters.perPage ?? 20 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg" />
              ))}
            </div>
          )}

          {!isLoading && (
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
                  onClick={() => handlePageChange((filters.page ?? 1) - 1)}
                >
                  قبلی
                </Button>
                <Button variant="outline" onClick={() => handlePageChange((filters.page ?? 1) + 1)}>
                  بعدی
                </Button>
              </div>
            </>
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
