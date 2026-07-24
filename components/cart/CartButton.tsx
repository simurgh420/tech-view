'use client';

import { useCart } from '@/hooks/useCart';
import { useCartUI } from '@/stores/cart-ui.store';
import { ShoppingCart } from 'lucide-react';

export function CartButton() {
  const { data } = useCart().useGetCartItems();
  const open = useCartUI(s => s.open);

  const count = data?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <button
      type="button"
      aria-label="سبد خرید"
      onClick={open}
      className="
        relative flex h-11 w-11 items-center justify-center rounded-full
        border border-gray-200/50 bg-white/70 shadow-sm backdrop-blur-md
        transition-all duration-200
        hover:scale-105 hover:shadow-md active:scale-95
        dark:border-gray-700/50 dark:bg-gray-800/60
      "
    >
      <ShoppingCart className="size-5 text-gray-700 dark:text-gray-200" />

      {count > 0 && (
        <span
          className="
            absolute -top-1 -end-1 flex h-5 min-w-5 items-center justify-center
            rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white shadow-md
          "
        >
          {count}
        </span>
      )}
    </button>
  );
}
