'use client';
import { useEffect, useRef } from 'react';
import { saleProducts } from './dummyProducts';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
export function ProductsOnSale() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth',
      });
    }
  };
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY, behavior: 'smooth' });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <section className="py-2 px-4 sm:px-6 lg:px-8">
      <div>
        {/* container مرکزی با بک‌گراند آبی */}
        <div className="rounded-2xl bg-linear-to-r from-[#002966] via-[#0f6fa4] to-[#002966] px-6 py-10 shadow-lg">
          {/* عنوان و دکمه */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-white">Products On Sale</h2>
            <a
              href="/products/sale"
              className="text-sm font-medium bg-white text-[#179BD7] px-4 py-2 rounded-md hover:bg-gray-100 transition"
            >
              View all &gt;
            </a>
          </div>

          {/* لیست محصولات */}
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide px-2"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="flex gap-6 min-h-full">
              {saleProducts.map(product => (
                <div key={product.title} className="min-w-[200px] shrink-0">
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <Button
              onClick={() => scroll('left')}
              className="bg-white text-[#179BD7] rounded-full shadow hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </Button>
            <Button
              onClick={() => scroll('right')}
              className="bg-white text-[#179BD7] rounded-full shadow hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
