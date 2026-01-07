'use client';

import { saleProducts } from '../../dummy/dummyProducts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll';
import { DiscountProductCard } from './DiscountProductCard';
export function ProductsOnSale() {
  const { scrollRef, scroll } = useHorizontalScroll();

  return (
    <section>
      <div>
        {/* container مرکزی با بک‌گراند آبی */}
        <div
          className="
  rounded-2xl
  bg-linear-to-r
  from-[oklch(18%_0.015_270)]
  via-[oklch(22%_0.02_270)]
  to-[oklch(18%_0.015_270)]
  px-6 py-10
  shadow-lg
  border border-white/5
  backdrop-blur-sm
"
        >
          {/* عنوان و دکمه */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold ">Products On Sale</h2>
            <a
              href="/products/sale"
              className="text-sm font-medium  text-[#179BD7] px-4 py-2 rounded-md hover:bg-gray-100 transition"
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
                <div key={product.title} className="min-w-50 shrink-0">
                  <DiscountProductCard {...product} />
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
