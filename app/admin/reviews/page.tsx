import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/query-client';
import { AdminReviewTable } from '@/components/admin/AdminReviewTable';
import { fetchAdminReviewsApi } from '@/services/reviews/api/queries';
import { adminReviewKeys } from '@/hooks/useReviews';

export default async function AdminReviewsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/unauthorized');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: adminReviewKeys.all,
    queryFn: () => fetchAdminReviewsApi(),
  });

  return (
    <div className="container mx-auto max-w-7xl px-6 py-10" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">مدیریت نظرات محصولات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          بازبینی نظرات ثبت‌شده کاربران در صفحه محصولات.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminReviewTable />
      </HydrationBoundary>
    </div>
  );
}
