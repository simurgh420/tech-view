'use client';

import BuyActions from './BuyActions';
import PriceDisplay from './PriceDisplay';
import StockStatus from './StockStatus';

type Props = {
  price: number;
  discountPrice?: number | null;
  stock: number;
  productId: string;
};

export default function ProductPriceBox({ price, discountPrice, stock, productId }: Props) {
  return (
    <aside
      className="
    overflow-hidden
    rounded-3xl

    border
    border-neutral-200/70

    bg-white

    p-4
    lg:p-6

    shadow-lg
    shadow-black/5

    dark:border-neutral-800/70
    dark:bg-[#1C2026]
    dark:shadow-black/30
  "
    >
      <div className="space-y-5">
        <PriceDisplay price={price} discountPrice={discountPrice} />

        <StockStatus stock={stock} />

        <BuyActions stock={stock} productId={productId} />
      </div>
    </aside>
  );
}
