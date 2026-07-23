import { CheckCircle2, XCircle } from 'lucide-react';

type Props = {
  stock: number;
};

export default function StockStatus({ stock }: Props) {
  const isOut = stock <= 0;

  if (isOut) {
    return (
      <div
        className="
          flex
          items-center
          gap-2
          rounded-xl
          bg-red-500/10
          px-3
          py-2.5
          text-sm
          font-medium
          text-red-600
          dark:bg-red-500/15
          dark:text-red-400
        "
      >
        <XCircle size={18} />

        <span>ناموجود</span>
      </div>
    );
  }

  return (
    <div
      className="
        flex
        items-center
        justify-between
        rounded-xl
        bg-emerald-500/10
        px-3
        py-2.5
        dark:bg-emerald-500/15
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-emerald-700
          dark:text-emerald-400
        "
      >
        <CheckCircle2 size={18} />

        <span>موجود در انبار</span>
      </div>

      <span
        className="
          rounded-lg
          bg-white/70
          px-2
          py-1
          text-xs
          font-medium
          text-neutral-600
          dark:bg-white/5
          dark:text-neutral-300
        "
      >
        {stock} عدد
      </span>
    </div>
  );
}
