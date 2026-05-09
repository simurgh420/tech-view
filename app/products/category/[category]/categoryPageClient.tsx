'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';

import SortMenu from '@/components/sections/products/SortMenu';
import ProductCard from '@/components/sections/products/ProductCard';
import ProductFilters from '@/components/sections/products/ProductFilters';
import { Button } from '@/components/ui';
import { FiltersProduct } from '@/types/product';
import { buildFiltersQueryString, parseSpecsFromURL } from '@/lib/url-helpers';

type CategoryProductsProps = {
  category: string;
};
export default function CategoryProductsClientPage({ category }: CategoryProductsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { useGetFilteredProducts } = useProducts();

  const initialFilters: FiltersProduct = {
    categorySlug: category,
    brandSlug: searchParams.get('brandSlug') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sort: (searchParams.get('sort') as FiltersProduct['sort']) || 'new',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    perPage: 20,
    specs: parseSpecsFromURL(searchParams),
  };
  const [filters, setFilters] = useState<FiltersProduct>(initialFilters);
  const { data: products, isLoading, error } = useGetFilteredProducts(filters);

  // Sync URL
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
        <section className="col-span-12 lg:col-span-9">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">دسته: {category}</h1>
            <SortMenu value={filters.sort ?? 'new'} onChange={handleSortChange} />
          </div>

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
        </section>

        <aside className="col-span-12 lg:col-span-3">
          <ProductFilters onChange={handleFiltersChange} initialCategorySlug={category} />
        </aside>
      </div>
    </div>
  );
}
