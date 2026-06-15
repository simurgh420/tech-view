// components/product/price/BuyActions.tsx
import { useNotify } from '@/hooks/useNotify';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart } from 'lucide-react';

export default function BuyActions({ stock, productId }: { stock: number; productId: string }) {
  const disabled = stock <= 0;
  const add = useCart().useAddToCart();
  const notify = useNotify();
  const handleAdd = () => {
    if (disabled) return;

    add.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => notify.success('به سبد اضافه شد'),
        onError: () => notify.error('خطا در افزودن به سبد'),
      }
    );
  };
  return (
    <div className="space-y-4">
      {/* خرید فوری */}
      <button
        disabled={disabled}
        className={`
          w-full py-4 rounded-xl font-semibold text-white text-lg
          transition-all duration-200 shadow-sm
          ${
            disabled
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg'
          }
        `}
      >
        خرید فوری
      </button>

      {/* افزودن به سبد خرید */}
      <button
        disabled={disabled}
        onClick={handleAdd}
        className={`
          w-full py-4 rounded-xl flex items-center justify-center gap-3 text-base font-medium
          transition-all duration-200 border
          ${
            disabled
              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-red-500 text-red-600 hover:bg-red-50 hover:shadow-md'
          }
        `}
      >
        <ShoppingCart size={20} className={disabled ? 'text-gray-400' : 'text-red-600'} />
        افزودن به سبد خرید
      </button>
    </div>
  );
}
