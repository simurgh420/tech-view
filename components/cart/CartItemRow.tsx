'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useNotify } from '@/hooks/useNotify';
import { CartItemWithProduct } from '@/types/cart';
import { formatPrice } from '@/lib/formatPrice';

type Props = {
  item: CartItemWithProduct;
};

export function CartItemRow({ item }: Props) {
  const notify = useNotify();
  const { mutate: updateQuantity, isPending: isUpdating } = useCart().useUpdateCartItemQuantity();
  const { mutate: removeItem, isPending: isRemoving } = useCart().useRemoveFromCart();

  // قبلاً همیشه قیمت اصلی (بدون تخفیف) نمایش داده می‌شد، درحالی‌که مجموع کل
  // (در CartCheckout/CartDrawer) درست discountPrice را حساب می‌کرد — یعنی
  // قیمت تک‌کالا با جمع کل ناهماهنگ بود
  const unitPrice = item.product?.isDiscounted
    ? Number(item.product?.discountPrice)
    : Number(item.product?.price);

  const busy = isUpdating || isRemoving;

  const inc = () => {
    updateQuantity(
      { id: item.id, quantity: item.quantity + 1 },
      { onError: () => notify.error('خطا در افزایش تعداد') }
    );
  };

  const dec = () => {
    if (item.quantity <= 1) return; // برای رسیدن به صفر باید دکمهٔ حذف استفاده شود
    updateQuantity(
      { id: item.id, quantity: item.quantity - 1 },
      { onError: () => notify.error('خطا در کاهش تعداد') }
    );
  };

  const del = () => {
    removeItem(item.id, {
      onError: () => notify.error('خطا در حذف آیتم'),
    });
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0 text-start">
        <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
          {item.product?.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{formatPrice(unitPrice)} تومان</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={dec}
            disabled={busy || item.quantity <= 1}
            aria-label="کاهش تعداد"
            className="flex h-7 w-7 items-center justify-center text-gray-500 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <Minus size={13} />
          </button>
          <span className="w-6 text-center text-sm font-medium text-gray-800 dark:text-gray-100">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={inc}
            disabled={busy}
            aria-label="افزایش تعداد"
            className="flex h-7 w-7 items-center justify-center text-gray-500 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <Plus size={13} />
          </button>
        </div>

        <button
          type="button"
          onClick={del}
          disabled={busy}
          aria-label="حذف از سبد خرید"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-950/40"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
