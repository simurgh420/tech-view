// components/product/price/ProductPriceBox.tsx
'use client';

import PriceDisplay from './PriceDisplay';
import StockStatus from './StockStatus';
import BuyActions from './BuyActions';

type Props = {
  price: number;
  discountPrice?: number | null;
  stock: number;
};

export default function ProductPriceBox({ price, discountPrice, stock }: Props) {
  return (
    <div className="p-5 rounded-xl border shadow-sm space-y-6">
      <PriceDisplay price={price} discountPrice={discountPrice} />

      <StockStatus stock={stock} />

      <BuyActions stock={stock} />
    </div>
  );
}
