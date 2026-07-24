'use client';

import { ShoppingCart } from 'lucide-react';

export function CartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <ShoppingCart className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
      </div>
      <p className="text-base font-semibold text-gray-900 dark:text-gray-100">سبد خرید خالی است</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">محصولی برای نمایش وجود ندارد</p>
    </div>
  );
}
