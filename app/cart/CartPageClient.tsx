'use client';

import { CartList } from '@/features/cart/components/CartList';
import { CartEmpty } from '@/features/cart/components/CartEmpty';
import { CartSkeleton } from '@/features/cart/components/CartSkeleton';
import { CartError } from '@/features/cart/components/CartError';
import { useNotify } from '@/hooks/useNotify';
import { CartCheckout } from '@/features/cart/components/CartCheckout';
import { useGetCartItems } from '@/features/cart/hooks/useCart';

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
