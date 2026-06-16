'use client';

import { CartItemWithProduct } from '@/types/cart';
import { useNotify } from '@/hooks/useNotify';
import { Button } from '../ui';
import { useRouter } from 'next/navigation';

type Props = {
  items: CartItemWithProduct[];
};

export function CartCheckout({ items }: Props) {
  const notify = useNotify();
  const router = useRouter();
  // محاسبه مجموع قیمت (با تخفیف اگر وجود داشته باشد)
  const total = items.reduce((sum, item) => {
    const price = item.product.isDiscounted
      ? Number(item.product.discountPrice)
      : Number(item.product.price);

    return sum + price * item.quantity;
  }, 0);

  const handleCheckout = () => {
    notify.info('در حال انتقال به صفحه پرداخت...');
    // انتقال به صفحه پرداخت
    router.push('/checkout');
  };

  return (
    <div className="border-t pt-6 mt-6 space-y-4">
      <div className="flex justify-between text-lg font-bold">
        <span>مجموع</span>
        <span>{total.toLocaleString()} تومان</span>
      </div>

      <Button
        variant={'secondary'}
        onClick={handleCheckout}
        className="w-full py-3 rounded-lg text-white font-medium"
      >
        ادامه فرآیند خرید
      </Button>
    </div>
  );
}
