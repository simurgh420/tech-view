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
        relative flex items-center justify-center
        w-11 h-11 rounded-full
        bg-white/70 dark:bg-gray-800/60
        backdrop-blur-md
        shadow-sm hover:shadow-md
        border border-gray-200/50 dark:border-gray-700/50
        transition-all duration-200
        hover:scale-105 active:scale-95
      "
    >
      <ShoppingCart className="size-5 text-gray-700 dark:text-gray-200" />

      {count > 0 && (
        <span
          className="
            absolute -top-1 -right-1
            min-w-5 h-5
            px-1.5
            rounded-full
            bg-red-600 text-white
            text-xs font-semibold
            flex items-center justify-center
            shadow-md
          "
        >
          {count}
        </span>
      )}
    </button>
  );
}
