'use client';

import { Button } from '@/components/ui/button';
import { OrderWithRelations } from '@/types/order';
import { useRouter } from 'next/navigation';

type SuccessPageClientProps = {
  order: OrderWithRelations;
};
export function SuccessPageClient({ order }: SuccessPageClientProps) {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-8">
      <h1 className="text-2xl font-bold text-green-600">سفارش شما با موفقیت ثبت شد 🎉</h1>

      <p className="text-gray-600">
        شماره سفارش: <span className="font-semibold">{order.id}</span>
      </p>

      <div className="border rounded-lg p-6 text-right space-y-4">
        <h2 className="font-semibold text-lg">آدرس ارسال</h2>

        <div className="text-sm space-y-1">
          <p>نام: {order.address?.fullName}</p>
          <p>شماره موبایل: {order.address?.phone}</p>
          <p>شهر: {order.address?.city}</p>
          <p>کد پستی: {order.address?.postalCode}</p>
          <p>آدرس: {order.address?.address}</p>
        </div>

        <h2 className="font-semibold text-lg mt-6">آیتم‌های سفارش</h2>

        <div className="space-y-2">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.title}</span>
              <span>
                {item.quantity} × {item.price.toLocaleString()} تومان
              </span>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 flex justify-between font-bold">
          <span>مجموع</span>
          <span>{order.total.toLocaleString()} تومان</span>
        </div>
      </div>

      <Button onClick={() => router.push('/orders')} className="mt-6">
        مشاهده سفارش‌ها
      </Button>
    </div>
  );
}
