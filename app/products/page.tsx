// app/products/page.tsx
'use client';

import { useState } from 'react';
import ProductCard from '@/components/sections/products/ProductCard';

import { useProducts } from '@/hooks/useProducts';
import ProductFilters from '@/components/sections/products/ProductFilters';
import SortMenu from '@/components/sections/products/SortMenu';

export default function ProductsPage() {
  const { useGetFilteredProducts } = useProducts();

  // ✅ state برای فیلترها و مرتب‌سازی
  const [filters, setFilters] = useState<{
    brandSlug?: string;
    category?: string;
    subCategory?: string;
    minPrice?: number;
    maxPrice?: number;
    ram?: string[];
    sort?: string;
  }>({});

  // ✅ گرفتن محصولات با فیلترها
  const { data: products, isLoading } = useGetFilteredProducts(filters);

  // ✅ تغییر مرتب‌سازی
  function handleSortChange(sort: string) {
    setFilters(prev => ({ ...prev, sort }));
  }

  // ✅ تغییر فیلترها
  function handleFiltersChange(newFilters: Partial<typeof filters>) {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }

  return (
    <div className="container mx-auto px-4 py-6 grid grid-cols-12 gap-6">
      {/* Sidebar Filters */}
      <aside className=" col-span-3 order-last ">
        <ProductFilters onChange={handleFiltersChange} />
      </aside>
      {/* Product List */}
      <section className="col-span-12 lg:col-span-9">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">محصولات</h1>
          <SortMenu value={filters.sort ?? 'new'} onChange={handleSortChange} />
        </div>

        {isLoading ? (
          <div className="text-center py-10">در حال بارگذاری...</div>
        ) : products?.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">محصولی یافت نشد ❌</div>
        )}
      </section>
    </div>
  );
}
