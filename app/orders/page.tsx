import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { auth } from '@/lib/auth';
import { getQueryClient } from '@/lib/query/query-client';
import { orderKeys } from '@/hooks/useOrders';
import { getUserOrdersDB } from '@/services/orders/db/queries';
import OrdersPageClient from './OrdersPageClient';

export type OrdersPageItem = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  itemsCount: number;
};

export default async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: orderKeys.all,
    queryFn: async (): Promise<OrdersPageItem[]> => {
      const orders = await getUserOrdersDB(session.user.id);

      return orders.map(order => ({
        id: order.id,
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt.toISOString(),
        itemsCount: order.items.length,
      }));
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersPageClient />
    </HydrationBoundary>
  );
}
