import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/query-client';
import { AdminProductTable } from '@/components/admin/AdminProductTable';
import { fetchAdminProductsApi } from '@/services/products/api/queries';
import { adminProductKeys } from '@/hooks/useProducts';
import { Breadcrumb } from '@/components/layout/breadcrumb';

export default async function AdminProductsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/unauthorized');
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/unauthorized');
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: adminProductKeys.all,
    queryFn: () => fetchAdminProductsApi(),
  });

  return (
    <div className="container mx-auto max-w-7xl px-6 py-10" dir="rtl">
      <div className="mb-2">
        <Breadcrumb />
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">مدیریت محصولات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مدیریت موجودی و نمایش محصولات در این بخش.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminProductTable />
      </HydrationBoundary>
    </div>
  );
}
