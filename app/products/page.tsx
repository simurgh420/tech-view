// app/products/page.tsx
'use client';

import { useState } from 'react';

import { useProducts } from '@/hooks/useProducts';
import SortMenu from '@/components/sections/products/SortMenu';
import ProductCard from '@/components/sections/products/ProductCard';
import ProductFilters from '@/components/sections/products/ProductFilters';

export default function ProductsPage() {
  const { useGetFilteredProducts } = useProducts();

  const [filters, setFilters] = useState<{
    brandSlug?: string;
    category?: string;
    subCategory?: string;
    minPrice?: number;
    maxPrice?: number;
    ram?: string[];
    sort?: string;
  }>({});

  const { data: products, isLoading } = useGetFilteredProducts(filters);

  function handleSortChange(sort: string) {
    setFilters(prev => ({ ...prev, sort }));
  }

  function handleFiltersChange(newFilters: Partial<typeof filters>) {
    setFilters(prev => ({ ...prev, ...newFilters }));
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

          {isLoading ? (
            <div className="text-center py-10 text-gray-600 dark:text-gray-400">
              در حال بارگذاری...
            </div>
          ) : products?.length ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              محصولی یافت نشد ❌
            </div>
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
