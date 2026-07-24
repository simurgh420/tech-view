'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { CartItemWithProduct } from '@/types/cart';
import { useNotify } from '@/hooks/useNotify';
import { Button } from '../ui';
import { formatPrice } from '@/lib/formatPrice';
import { useState } from 'react';

type Props = {
  items: CartItemWithProduct[];
};

export function CartCheckout({ items }: Props) {
  const notify = useNotify();
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  const total = items.reduce((sum, item) => {
    const price = item.product?.isDiscounted
      ? Number(item.product?.discountPrice)
      : Number(item.product?.price);

    return sum + price * item.quantity;
  }, 0);

  const handleCheckout = () => {
    setNavigating(true);
    notify.info('در حال انتقال به صفحهٔ پرداخت...');
    router.push('/checkout');
  };

  return (
    <div className="mt-6 space-y-4 border-t border-gray-200 pt-6 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">مجموع</span>
        <span className="text-lg font-bold text-red-600 dark:text-red-400">
          {formatPrice(total)} <span className="text-xs font-normal text-gray-500">تومان</span>
        </span>
      </div>

      <Button
        onClick={handleCheckout}
        disabled={navigating}
        className="w-full gap-2 rounded-xl bg-linear-to-l from-red-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-md shadow-red-500/25 transition-all hover:shadow-lg hover:shadow-red-500/40 disabled:opacity-60"
      >
        {navigating ? <Loader2 size={16} className="animate-spin" /> : <ArrowLeft size={16} />}
        ادامهٔ فرآیند خرید
      </Button>
    </div>
  );
}
