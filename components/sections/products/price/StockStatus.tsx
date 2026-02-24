// components/product/price/StockStatus.tsx
export default function StockStatus({ stock }: { stock: number }) {
  if (stock <= 0) return <div className="text-red-600 font-medium">ناموجود</div>;

  return <div className="text-green-600 font-medium">موجود در انبار • {stock} عدد</div>;
}
    