'use client';

import { AlertTriangle } from 'lucide-react';

export function CartError() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
        <AlertTriangle className="h-8 w-8 text-red-500" strokeWidth={1.5} />
      </div>
      <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
        خطا در بارگذاری سبد خرید
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">لطفاً دوباره تلاش کنید</p>
    </div>
  );
}
