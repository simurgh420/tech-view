// components/product/price/StockStatus.tsx
import { CheckCircle, XCircle } from 'lucide-react';

export default function StockStatus({ stock }: { stock: number }) {
  const isOut = stock <= 0;

  if (isOut) {
    return (
      <div className="flex items-center gap-2 text-red-500 font-medium text-sm">
        <XCircle size={18} className="text-red-500" />
        <span>ناموجود</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
      <CheckCircle size={18} className="text-emerald-600" />
      <span>موجود در انبار</span>
      <span className="text-gray-500 text-xs">• {stock} عدد</span>
    </div>
  );
}
