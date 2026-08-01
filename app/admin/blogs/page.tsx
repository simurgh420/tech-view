import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminBlogPosts } from '@/services/blog/db/queries';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/query-client';
import { AdminBlogTable } from '@/components/admin/AdminBlogTable';
import { blogKeys } from '@/hooks/useBlogs';
import { Breadcrumb } from '@/components/layout/breadcrumb';

export default async function AdminBlogsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/unauthorized');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: blogKeys.admin,
    queryFn: () => getAdminBlogPosts(),
  });
  return (
    <div className="container mx-auto max-w-7xl px-6 py-10" dir="rtl">
      <div className="mb-2">
        <Breadcrumb />
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">مدیریت بلاگ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            مشاهده، ویرایش و مدیریت پست‌های سایت از این بخش.
          </p>
        </div>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminBlogTable />
      </HydrationBoundary>
    </div>
  );
}
