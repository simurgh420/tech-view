// components/cart/CartDrawer.tsx
'use client';

import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { useNotify } from '@/hooks/useNotify';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CartSkeleton } from './CartSkeleton';
import { CartError } from './CartError';
import { CartEmpty } from './CartEmpty';
import { CartList } from './CartList';
import { CartCheckout } from './CartCheckout';
import { useCartUI } from '@/stores/cart-ui.store';

export function CartDrawer() {
  const { isOpen, close } = useCartUI();
  const notify = useNotify();
  const { data, isLoading, isError } = useCart().useGetCartItems();

  useEffect(() => {
    if (isError) notify.error('خطا در دریافت سبد خرید');
  }, [isError, notify]);

  const items = data ?? [];

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      {/* عرض قبلاً w-95 / sm:w-105 بود که اصلاً در مقیاس پیش‌فرض Tailwind
          وجود ندارد (هیچ CSSای تولید نمی‌کرد)؛ با مقدار دلخواه جایگزین شد */}
      <SheetContent side="right" className="flex w-95 flex-col p-0 sm:w-105">
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

        {/* بخش پایین: جمع کل + دکمه (از همان CartCheckout استفاده می‌شود تا
            منطق محاسبهٔ مجموع و متن دکمه در دو جا تکرار/ناهماهنگ نباشد) */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <CartCheckout items={items} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
