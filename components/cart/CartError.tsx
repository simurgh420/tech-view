'use client';

import { AlertTriangle } from 'lucide-react';

export function CartError() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center text-red-500">
      <AlertTriangle className="size-10 mb-4" />
      <p className="text-lg font-medium">خطا در بارگذاری سبد خرید</p>
      <p className="text-sm text-muted-foreground mt-1">لطفاً دوباره تلاش کنید</p>
    </div>
  );
}
