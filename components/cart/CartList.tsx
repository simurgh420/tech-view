// components/cart/CartList.tsx
import { CartItemWithProduct } from '@/types/cart';
import { CartItemRow } from './CartItemRow';
import Image from 'next/image';

export function CartList({ items }: { items: CartItemWithProduct[] }) {
  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.id} className="flex gap-3 rounded-lg border p-3 shadow-sm bg-background">
          {/* تصویر */}
          <div className="w-16 h-16 rounded-md bg-muted overflow-hidden shrink-0">
            <Image
              src={item.product.thumbnail || '/placeholder.jpg'}
              alt={item.product.title}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>

          {/* اطلاعات + کنترل‌ها */}
          <div className="flex-1">
            <CartItemRow item={item} />
          </div>
        </div>
      ))}
    </div>
  );
}
