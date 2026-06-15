'use client';

import { useCart } from '@/hooks/useCart';
import { useNotify } from '@/hooks/useNotify';
import { Button } from '../ui';
import { CartItemWithProduct } from '@/types/cart';

type Props = {
  item: CartItemWithProduct;
};
export function CartItemRow({ item }: Props) {
  const notify = useNotify();
  const update = useCart().useUpdateCartItemQuantity();
  const remove = useCart().useRemoveFromCart();

  const inc = () => {
    update.mutate(
      { id: item.id, quantity: item.quantity + 1 },
      {
        onSuccess: () => notify.success('تعداد افزایش یافت'),
        onError: () => notify.error('خطا در افزایش تعداد'),
      }
    );
  };

  const dec = () => {
    update.mutate(
      { id: item.id, quantity: item.quantity - 1 },
      {
        onSuccess: () => notify.success('تعداد کاهش یافت'),
        onError: () => notify.error('خطا در کاهش تعداد'),
      }
    );
  };

  const del = () => {
    remove.mutate(item.id, {
      onSuccess: () => notify.success('آیتم حذف شد'),
      onError: () => notify.error('خطا در حذف آیتم'),
    });
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="font-medium">{item.product.title}</p>
        <p className="text-sm text-muted-foreground">{item.product.price.toLocaleString()} تومان</p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant={'ghost'} onClick={dec} className="btn-sm">
          -
        </Button>
        <span>{item.quantity}</span>
        <Button variant={'ghost'} onClick={inc} className="btn-sm">
          +
        </Button>
        <Button variant={'destructive'} onClick={del} className="text-red-500 text-sm">
          حذف
        </Button>
      </div>
    </div>
  );
}
