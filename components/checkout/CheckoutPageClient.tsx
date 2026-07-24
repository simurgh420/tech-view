import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { CheckoutForm } from './CheckoutForm';
import { CheckoutSummary } from './CheckoutSummary';
import { CartItemWithProduct } from '@/types/cart';
import { Button } from '@/components/ui';

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
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <ShoppingBag className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          سبد خرید شما خالی است
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          برای ادامه به مرحلهٔ پرداخت، ابتدا محصولی به سبد خرید اضافه کنید.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">مشاهدهٔ محصولات</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
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
