// app/product/edit/[slug]/page.tsx

import { Skeleton } from '@/components/ui/skeleton';
import EditProductClientPage from './EditProductPageClient';
import { Suspense } from 'react';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
          {/* عنوان فرم */}
          <Skeleton variant="text" className="h-8 w-2/3" />
          {/* فیلدهای فرم */}
          <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
          <Skeleton variant="rect" className="h-32 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
            <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
          <Skeleton variant="rect" className="h-40 w-full rounded-lg" />
          <Skeleton variant="rect" className="h-40 w-full rounded-lg" />
          {/* دکمهٔ ثبت */}
          <Skeleton variant="rect" className="h-12 w-full rounded-lg" />
        </div>
      }
    >
      <EditProductClientPage slug={slug} />;
    </Suspense>
  );
}
