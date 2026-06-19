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
  const { mutate: updateQuantity } = useCart().useUpdateCartItemQuantity();
  const { mutate: removeItem } = useCart().useRemoveFromCart();
  const inc = () => {
    updateQuantity(
      { id: item.id, quantity: item.quantity + 1 },
      { onError: () => notify.error('خطا در افزایش تعداد') }
    );
  };

  const dec = () => {
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
    <div className="flex justify-between items-center">
      <div>
        <p className="font-medium">{item.product?.title}</p>
        <p className="text-sm text-muted-foreground">
          {item.product?.price.toLocaleString()} تومان
        </p>
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
