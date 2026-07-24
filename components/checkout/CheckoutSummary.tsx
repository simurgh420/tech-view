import Image from 'next/image';
import { Package } from 'lucide-react';
import { CartItemWithProduct } from '@/types/cart';
import { formatPrice } from '@/lib/formatPrice';

type CheckoutSummaryProps = {
  items: CartItemWithProduct[];
};

export function CheckoutSummary({ items }: CheckoutSummaryProps) {
  const total = items.reduce((sum, item) => {
    const price = item.product?.isDiscounted
      ? Number(item.product?.discountPrice)
      : Number(item.product?.price);
    return sum + price * item.quantity;
  }, 0);

  return (
    <aside className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <Package size={18} className="text-red-600 dark:text-red-400" />
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">خلاصه سفارش</h2>
        <span className="text-xs text-gray-400">({items.length} کالا)</span>
      </div>

      <div className="max-h-80 space-y-4 overflow-auto pe-1">
        {items.map(item => {
          const unitPrice = Number(item.product?.discountPrice ?? item.product?.price);

          return (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-950/60">
                <Image
                  src={item.product?.thumbnail ?? '/placeholder.png'}
                  alt={item.product?.title ?? 'محصول'}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              </div>

              <div className="min-w-0 flex-1 text-start">
                <p className="line-clamp-1 text-sm font-medium text-gray-800 dark:text-gray-100">
                  {item.product?.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">تعداد: {item.quantity}</p>
              </div>

              <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-100">
                {formatPrice(item.quantity * unitPrice)} تومان
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">مجموع</span>
        <span className="text-lg font-bold text-red-600 dark:text-red-400">
          {formatPrice(total)} تومان
        </span>
      </div>
    </aside>
  );
}
