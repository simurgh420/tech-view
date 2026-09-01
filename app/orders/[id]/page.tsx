// app/orders/[id]/page.tsx
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { auth } from '@/lib/auth';
import { getQueryClient } from '@/lib/query/query-client';
import { orderKeys } from '@/hooks/useOrders';
import { getOrderByIdDB } from '@/services/orders/db/queries';
import OrderDetailClientPage from './OrderDetailClientPage';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect('/login');
  }

  const queryClient = getQueryClient();

  const order = await getOrderByIdDB(id, session.user.id);
  if (!order) {
    notFound();
  }

  await queryClient.prefetchQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => order,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrderDetailClientPage orderId={id} />
    </HydrationBoundary>
  );
}
