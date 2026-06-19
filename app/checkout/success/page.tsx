import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { getOrderByIdDB } from '@/services/orders/db/queries';
import { SuccessPageClient } from '@/components/checkout/SuccessPageClient';
import { headers } from 'next/headers';

type SuccessPageProps = {
  searchParams: {
    orderId?: string;
  };
};
export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) notFound();

  const orderId = searchParams.orderId;
  if (!orderId) notFound();

  const order = await getOrderByIdDB(orderId, session.user.id);
  if (!order) notFound();

  return <SuccessPageClient order={order} />;
}
