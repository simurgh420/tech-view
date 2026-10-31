// app/checkout/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCartForCheckout } from '@/features/cart/server/queries';
import { headers } from 'next/headers';
import { CheckoutPageClient } from '@/features/checkout/components/CheckoutPageClient';

export default async function CheckoutPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/checkout');
  }

  const cart = await getCartForCheckout(session.user.id);

  if (!cart || cart.items.length === 0) {
    redirect('/cart');
  }

  return (
    <CheckoutPageClient
      user={session.user}
      items={cart.items as Parameters<typeof CheckoutPageClient>[0]['items']}
    />
  );
}
