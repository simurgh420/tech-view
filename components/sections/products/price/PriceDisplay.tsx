// components/product/price/PriceDisplay.tsx
const formatPrice = (value: number) => new Intl.NumberFormat('en-US').format(value);

export default function PriceDisplay({
  price,
  discountPrice,
}: {
  price: number;
  discountPrice?: number | null;
}) {
  const hasDiscount = discountPrice && discountPrice < price;
  const percent = hasDiscount ? Math.round(((price - discountPrice!) / price) * 100) : 0;

  return (
    <div className="space-y-2">
      {hasDiscount ? (
        <>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-red-600">
              {formatPrice(discountPrice!)} تومان
            </span>
            <span
              className="
    flex items-center justify-center
    text-xs font-bold
    bg-red-100 text-red-600
    px-2 py-0.5
    rounded-md
    leading-none
  "
            >
              {percent}٪
            </span>
          </div>

          <div className="text-gray-500 line-through">{formatPrice(price)} تومان</div>
        </>
      ) : (
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {formatPrice(price)} تومان
        </div>
      )}
    </div>
  );
}
