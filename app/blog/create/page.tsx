// app/(whatever)/blog/create/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { CreateBlogPageClient } from './CreateBlogPageClient';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default async function CreateBlogPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect('/unauthorized');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-right">✍️ ایجاد بلاگ جدید</h1>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton variant="text" className="h-8 w-2/3" />
            <Skeleton variant="rect" className="h-10 w-full" />
            <Skeleton variant="rect" className="h-32 w-full" />
            <Skeleton variant="rect" className="h-10 w-full" />
            <Skeleton variant="rect" className="h-40 w-full" />
            <Skeleton variant="rect" className="h-12 w-full" />
          </div>
        }
      >
        <CreateBlogPageClient />
      </Suspense>
    </div>
  );
}
