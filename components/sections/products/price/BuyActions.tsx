// components/product/price/BuyActions.tsx
import { ShoppingCart } from 'lucide-react';

export default function BuyActions({ stock }: { stock: number }) {
  const disabled = stock <= 0;

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
