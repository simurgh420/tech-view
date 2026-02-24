// components/product/price/BuyActions.tsx
import { ShoppingCart } from 'lucide-react';

export default function BuyActions({ stock }: { stock: number }) {
  const disabled = stock <= 0;

  return (
    <div className="space-y-3">
      <button
        disabled={disabled}
        className={`w-full py-3 rounded-lg text-white font-semibold transition ${
          disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        خرید فوری
      </button>

      <button
        disabled={disabled}
        className={`w-full py-3 rounded-lg border flex items-center justify-center gap-2 font-medium transition ${
          disabled
            ? 'border-gray-400 text-gray-400 cursor-not-allowed'
            : 'border-blue-600 text-blue-600 hover:bg-blue-50'
        }`}
      >
        <ShoppingCart size={18} />
        افزودن به سبد خرید
      </button>
    </div>
  );
}
