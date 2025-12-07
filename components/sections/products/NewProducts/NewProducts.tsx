'use client';
import { newProducts } from '@/components/sections/dummy/dummyNewProducts';
import { ProductCard } from './NewProductCard';
import Link from 'next/link';
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll';

export function NewProducts() {
  const { scrollRef } = useHorizontalScroll();
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-white px-6 py-10 shadow-lg">
        {/* عنوان و دکمه */}
        <div className="flex flex-col sm:flex-row sm: items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">New Products</h2>
          <Link
            href="/products/new"
            className="text-sm font-medium bg-[#179BD7] text-white px-4 py-2 rounded-md hover:bg-[#1279a8] transition"
          >
            View all &gt;
          </Link>
        </div>
        {/* لیست محصولات */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide px-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="flex gap-6 min-h-full">
            {newProducts.map(product => (
              <div key={product.title} className="min-w-[220px] shrink-0">
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
