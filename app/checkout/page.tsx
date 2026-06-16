// app/checkout/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCartForCheckout } from '@/services/cart/db/queries';
import { CheckoutPageClient } from '@/components/checkout/CheckoutPageClient';
import { headers } from 'next/headers';

export default async function CheckoutPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login?callbackUrl=/checkout');
  }

  const cart = await getCartForCheckout(session.user.id);

  if (!cart || cart.items.length === 0) {
    redirect('/cart');
  }

  return <CheckoutPageClient user={session.user} items={cart.items} />;
}
