import Image from 'next/image';
import { CartItemWithProduct } from '@/types/cart';

type CheckoutSummaryProps = {
  items: CartItemWithProduct[];
};

export function CheckoutSummary({ items }: CheckoutSummaryProps) {
  const total = items.reduce((sum, item) => {
    const price = item.product.isDiscounted
      ? Number(item.product.discountPrice)
      : Number(item.product.price);
    return sum + price * item.quantity;
  }, 0);

  return (
    <aside className="border rounded-lg p-4 space-y-4  shadow-sm">
      <h2 className="font-semibold text-lg">خلاصه سفارش</h2>

      <div className="space-y-4 max-h-80 overflow-auto pr-1">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image
                src={item.product.thumbnail ?? '/placeholder.png'}
                alt={item.product.title}
                width={60}
                height={60}
                className="rounded-md border object-cover"
              />

              <div className="text-sm">
                <p className="font-medium line-clamp-1">{item.product.title}</p>
                <p className="text-gray-500 text-xs">تعداد: {item.quantity}</p>
              </div>
            </div>

            <span className="text-sm font-semibold whitespace-nowrap">
              {(
                item.quantity * Number(item.product.discountPrice ?? item.product.price)
              ).toLocaleString()}{' '}
              تومان
            </span>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 flex justify-between font-bold text-lg">
        <span>مجموع</span>
        <span>{total.toLocaleString()} تومان</span>
      </div>
    </aside>
  );
}
