'use client';

import { ShoppingCart } from 'lucide-react';

export function CartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <ShoppingCart className="size-10 text-muted-foreground mb-4" />
      <p className="text-lg font-medium">سبد خرید خالی است</p>
      <p className="text-sm text-muted-foreground mt-1">محصولی برای نمایش وجود ندارد</p>
    </div>
  );
}
