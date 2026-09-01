import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/query-client';
import { adminOrderKeys } from '@/hooks/useOrders';
import { getAdminOrderByIdDB } from '@/services/orders/db/queries';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import AdminOrderDetailClientPage from './AdminOrderDetailClientPage';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/unauthorized');
  if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) redirect('/unauthorized');

  const order = await getAdminOrderByIdDB(id);
  if (!order) notFound();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: adminOrderKeys.detail(id),
    queryFn: async () => order,
  });

  return (
    <div className="container mx-auto max-w-4xl px-6 py-10" dir="rtl">
      <div className="mb-2">
        <Breadcrumb />
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminOrderDetailClientPage orderId={id} />
      </HydrationBoundary>
    </div>
  );
}
