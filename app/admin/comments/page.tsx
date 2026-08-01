import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/query-client';
import { AdminCommentTable } from '@/components/admin/AdminCommentTable';
import { fetchAllCommentsAdminApi } from '@/services/comments/api/queries';
import { adminCommentKeys } from '@/hooks/useAdmin/useAdminComments';

export default async function AdminCommentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/unauthorized');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: adminCommentKeys.all,
    queryFn: () => fetchAllCommentsAdminApi(),
  });

  return (
    <div className="container mx-auto max-w-7xl px-6 py-10" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">مدیریت کامنت‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          نظرات کاربران را مشاهده و برای انتشار یا حذف بررسی کنید.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminCommentTable />
      </HydrationBoundary>
    </div>
  );
}
