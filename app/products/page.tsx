// app/products/page.tsx
'use client';

import ProductCard from '@/components/sections/products/ProductCard';
import ProductFilters from '@/components/sections/products/ProductFilters';
import SortMenu from '@/components/sections/products/SortMenu';
import { useProducts } from '@/hooks/useProducts';

export default function ProductsPage() {
  const { useGetProducts } = useProducts();
  const { data: products, isLoading } = useGetProducts();

  return (
    <div className="container mx-auto px-4 py-6 grid grid-cols-12 gap-6">
      {/* Sidebar Filters */}
      <aside className="hidden lg:block col-span-3">
        <ProductFilters />
      </aside>

      {/* Product List */}
      <section className="col-span-12 lg:col-span-9">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">محصولات</h1>
          <SortMenu />
        </div>

        {isLoading ? (
          <div className="text-center py-10">در حال بارگذاری...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {products?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
