'use client';

import { CartList } from '@/components/cart/CartList';
import { CartEmpty } from '@/components/cart/CartEmpty';
import { CartSkeleton } from '@/components/cart/CartSkeleton';
import { CartError } from '@/components/cart/CartError';
import { useNotify } from '@/hooks/useNotify';
import { CartCheckout } from '@/components/cart/CartCheckout';
import { useGetCartItems } from '@/hooks/useCart';

export function CartPageClient() {
  const notify = useNotify();
  const { data, isLoading, isError } = useGetCartItems();

  if (isError) notify.error('خطا در دریافت سبد خرید');

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">سبد خرید</h1>

      {isLoading && <CartSkeleton />}
      {isError && <CartError />}
      {data?.length === 0 && <CartEmpty />}

      {data && data.length > 0 && (
        <>
          <CartList items={data} />
          <CartCheckout items={data} />
        </>
      )}
    </div>
  );
}
