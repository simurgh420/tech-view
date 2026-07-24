// components/cart/CartList.tsx
import Image from 'next/image';
import { CartItemWithProduct } from '@/types/cart';
import { CartItemRow } from './CartItemRow';

export function CartList({ items }: { items: CartItemWithProduct[] }) {
  return (
    <div className="space-y-3">
      {items.map(item => (
        <div
          key={item.id}
          className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          {/* تصویر */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-950/60">
            <Image
              src={item.product?.thumbnail || '/placeholder.jpg'}
              alt={item.product?.title ?? 'محصول'}
              fill
              sizes="64px"
              className="object-contain p-1.5"
            />
          </div>

          {/* اطلاعات + کنترل‌ها */}
          <div className="min-w-0 flex-1">
            <CartItemRow item={item} />
          </div>
        </div>
      ))}
    </div>
  );
}
