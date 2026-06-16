import { CheckoutForm } from './CheckoutForm';
import { CheckoutSummary } from './CheckoutSummary';
import { CartItemWithProduct } from '@/types/cart';

type CheckoutPageClientProps = {
  user: {
    id: string;
    name: string | null;
    phone?: string | null;
    email: string;
  };
  items: CartItemWithProduct[];
};

export function CheckoutPageClient({ user, items }: CheckoutPageClientProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* فرم */}
        <div>
          <CheckoutForm
            defaultValues={{
              fullName: user.name ?? '',
              phone: user.phone ?? '',
              city: '',
              postalCode: '',
              address: '',
            }}
          />
        </div>

        {/* خلاصه سفارش */}
        <div className="h-fit lg:sticky lg:top-24">
          <CheckoutSummary items={items} />
        </div>
      </div>
    </div>
  );
}
