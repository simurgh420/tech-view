// components/product/price/PriceDisplay.tsx
import { formatPrice } from '@/lib/formatPrice';

type Props = {
  price: number;
  discountPrice?: number | null;
};

export default function PriceDisplay({ price, discountPrice }: Props) {
  const hasDiscount =
    discountPrice !== null && discountPrice !== undefined && discountPrice < price;

  const percent = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  return (
    <div className="space-y-3">
      {hasDiscount ? (
        <>
          <div className="flex items-center justify-between">
            <span
              className="
                rounded-lg
                bg-red-500/10
                px-2.5
                py-1
                text-xs
                font-bold
                text-red-600
                dark:bg-red-500/15
                dark:text-red-400
              "
            >
              {percent}٪ تخفیف
            </span>

            <span
              className="
                text-sm
                text-neutral-500
                line-through
                dark:text-neutral-400
              "
            >
              {formatPrice(price)}
            </span>
          </div>

          <div className="space-y-1">
            <div
              className="
                text-3xl
                font-extrabold
                tracking-tight
                text-neutral-900
                dark:text-neutral-100
              "
            >
              {formatPrice(discountPrice)}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-1">
          <div
            className="
              text-3xl
              font-extrabold
              tracking-tight
              text-neutral-900
              dark:text-neutral-100
            "
          >
            {formatPrice(price)}
          </div>

          <div
            className="
              text-sm
              font-medium
              text-neutral-500
              dark:text-neutral-400
            "
          >
            تومان
          </div>
        </div>
      )}
    </div>
  );
}
