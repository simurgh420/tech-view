import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/query-client';
import { AdminOrderTable } from '@/components/admin/AdminOrderTable';
import { getAdminOrdersDB } from '@/services/orders/db/queries';
import { adminOrderKeys } from '@/hooks/useOrders';
import { Breadcrumb } from '@/components/layout/breadcrumb';

export default async function AdminOrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/unauthorized');
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/unauthorized');
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: adminOrderKeys.all,
    queryFn: () => getAdminOrdersDB(),
  });

  return (
    <div className="container mx-auto max-w-7xl px-6 py-10" dir="rtl">
      <div className="mb-2">
        <Breadcrumb />
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">مدیریت سفارش‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مشاهده و مدیریت وضعیت سفارش‌های ثبت‌شده در سایت.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminOrderTable />
      </HydrationBoundary>
    </div>
  );
}
