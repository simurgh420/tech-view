'use client';

import { useGetCartItems } from '@/hooks/useCart';
import { useCartUI } from '@/stores/cart-ui.store';
import { ShoppingCart } from 'lucide-react';
import { HeaderIconButton } from './Headericonbutton';

export function CartButton() {
  const { data } = useGetCartItems();
  const open = useCartUI(s => s.open);

  const count = data?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <HeaderIconButton aria-label="سبد خرید" onClick={open}>
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
    </HeaderIconButton>
  );
}
