import { ShoppingCart } from 'lucide-react';

import { useCart } from '@/hooks/useCart';
import { useNotify } from '@/hooks/useNotify';

type Props = {
  stock: number;
  productId: string;
};

export default function BuyActions({ stock, productId }: Props) {
  const disabled = stock <= 0;

  const add = useCart().useAddToCart();
  const notify = useNotify();

  const handleAdd = () => {
    if (disabled || add.isPending) return;

    add.mutate(
      {
        productId,
        quantity: 1,
      },
      {
        onSuccess: () => notify.success('به سبد خرید اضافه شد'),
        onError: () => notify.error('خطا در افزودن به سبد خرید'),
      }
    );
  };

  return (
    <div className="space-y-3">
      {/* خرید فوری */}
      <button
        disabled={disabled || add.isPending}
        className={`
          flex h-12 w-full items-center justify-center rounded-xl
          text-sm font-semibold text-white
          transition-all duration-200
          active:scale-[0.98]

          ${
            disabled
              ? `
                cursor-not-allowed
                bg-neutral-300
                text-neutral-500
                dark:bg-neutral-800
                dark:text-neutral-500
              `
              : `
                bg-linear-to-l
                from-red-500
                to-rose-600
                shadow-lg
                shadow-red-500/20

                hover:-translate-y-0.5
                hover:shadow-xl
                hover:shadow-red-500/30
              `
          }
        `}
      >
        خرید فوری
      </button>

      {/* افزودن به سبد */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled || add.isPending}
        className={`
          flex h-12 w-full items-center justify-center gap-2
          rounded-xl border
          text-sm font-semibold
          transition-all duration-200
          active:scale-[0.98]

          ${
            disabled
              ? `
                cursor-not-allowed
                border-neutral-300
                text-neutral-400

                dark:border-neutral-700
                dark:text-neutral-500
              `
              : `
                border-red-500/70
                text-red-600

                hover:bg-red-50
                hover:border-red-600

                dark:border-red-500/60
                dark:text-red-400
                dark:hover:bg-red-500/10
              `
          }
        `}
      >
        <ShoppingCart size={18} />

        {add.isPending ? 'در حال افزودن...' : 'افزودن به سبد خرید'}
      </button>
    </div>
  );
}
