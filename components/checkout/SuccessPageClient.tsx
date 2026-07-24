'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Copy, Check, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderWithRelations } from '@/types/order';
import { formatPrice } from '@/lib/formatPrice';

type SuccessPageClientProps = {
  order: OrderWithRelations;
};

export function SuccessPageClient({ order }: SuccessPageClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access denied — silently ignore, not critical
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 text-center">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
        <CheckCircle2
          className="h-10 w-10 text-emerald-600 dark:text-emerald-400"
          strokeWidth={1.5}
        />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        سفارش شما با موفقیت ثبت شد
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        رسید سفارش برای شما ارسال شد؛ به‌زودی سفارشتان پردازش می‌شود.
      </p>

      <button
        type="button"
        onClick={handleCopy}
        className="mx-auto mt-5 flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        شماره سفارش:{' '}
        <span dir="ltr" className="font-mono font-medium">
          {order.id}
        </span>
        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
      </button>

      <div className="mt-8 space-y-6 rounded-2xl border border-gray-200 p-6 text-start dark:border-gray-800">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
            <MapPin size={16} className="text-red-600 dark:text-red-400" />
            آدرس ارسال
          </div>

          <div className="grid gap-1.5 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-2">
            <p>نام: {order.address?.fullName}</p>
            <p dir="ltr" className="text-end sm:text-start">
              شماره موبایل: {order.address?.phone}
            </p>
            <p>شهر: {order.address?.city}</p>
            <p>کد پستی: {order.address?.postalCode}</p>
            <p className="sm:col-span-2">آدرس: {order.address?.address}</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-200 pt-6 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
            <Package size={16} className="text-red-600 dark:text-red-400" />
            آیتم‌های سفارش
          </div>

          <div className="space-y-2">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{item.title}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {item.quantity} × {formatPrice(item.price)} تومان
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
          <span className="font-bold text-gray-900 dark:text-gray-100">مجموع</span>
          <span className="text-lg font-bold text-red-600 dark:text-red-400">
            {formatPrice(order.total)} تومان
          </span>
        </div>
      </div>

      <Button
        onClick={() => router.push('/orders')}
        className="mt-8 gap-2 bg-linear-to-l from-red-500 to-rose-600 px-8 shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/40"
      >
        مشاهدهٔ سفارش‌ها
      </Button>
    </div>
  );
}
