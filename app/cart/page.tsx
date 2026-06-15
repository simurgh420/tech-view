import { CartPageClient } from './CartPageClient';

export const metadata = {
  title: 'سبد خرید | Tech View',
};

export default function CartPage() {
  return (
    <div className="container py-10">
      <CartPageClient />
    </div>
  );
}
