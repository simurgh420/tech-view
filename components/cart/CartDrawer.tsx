// components/cart/CartDrawer.tsx
'use client';

import { useCart } from '@/hooks/useCart';
import { useNotify } from '@/hooks/useNotify';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CartSkeleton } from './CartSkeleton';
import { CartError } from './CartError';
import { CartEmpty } from './CartEmpty';
import { CartList } from './CartList';
import { useCartUI } from '@/stores/cart-ui.store';
import { Button } from '../ui';

export function CartDrawer() {
  const { isOpen, close } = useCartUI();
  const notify = useNotify();
  const { data, isLoading, isError } = useCart().useGetCartItems();

  if (isError) notify.error('خطا در دریافت سبد خرید');

  const items = data ?? [];
  const total = items.reduce((sum, item) => {
    const price = item.product.isDiscounted
      ? Number(item.product.discountPrice)
      : Number(item.product.price);
    return sum + price * item.quantity;
  }, 0);

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent side="right" className="w-95 sm:w-105 p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>سبد خرید</SheetTitle>
        </SheetHeader>

        {/* لیست آیتم‌ها */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && <CartSkeleton />}
          {isError && <CartError />}
          {items.length === 0 && !isLoading && !isError && <CartEmpty />}
          {items.length > 0 && <CartList items={items} />}
        </div>

        {/* بخش پایین: جمع کل + دکمه */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">مجموع</span>
              <span className="font-bold">
                {total.toLocaleString('fa-IR')} <span className="text-xs">تومان</span>
              </span>
            </div>

            <Button
              variant={'secondary'}
              className="w-full py-3 rounded-lg  text-white text-sm font-medium hover:opacity-90 transition"
              onClick={() => {
                // بعداً می‌تونی اینجا router.push('/cart') یا '/checkout' بذاری
                notify.info('به زودی به صفحه سبد/پرداخت هدایت می‌شوید');
              }}
            >
              ادامه فرآیند خرید
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
