// components/cart/CartDrawer.tsx
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CartSkeleton } from './CartSkeleton';
import { CartError } from './CartError';
import { CartEmpty } from './CartEmpty';
import { CartList } from './CartList';
import { CartCheckout } from './CartCheckout';
import { useCartUI } from '@/stores/cart-ui.store';
import { useGetCartItems } from '@/hooks/useCart';

export function CartDrawer() {
  const { isOpen, close } = useCartUI();
  const { data, isLoading, isError } = useGetCartItems();

  const items = data ?? [];

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent side="left" className="flex w-95 flex-col p-0 sm:w-105">
        <SheetHeader className="border-b border-gray-200 p-4 dark:border-gray-800">
          <SheetTitle>سبد خرید</SheetTitle>
        </SheetHeader>

        {/* لیست آیتم‌ها */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {isLoading && <CartSkeleton />}
          {isError && <CartError />}
          {!isLoading && !isError && items.length === 0 && <CartEmpty />}
          {items.length > 0 && <CartList items={items} />}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <CartCheckout items={items} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
