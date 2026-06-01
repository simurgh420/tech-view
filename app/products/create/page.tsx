// app/products/create/page.tsx

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import CreateProductPageClient from './CreateProductPageClient';

export default function CreateProductPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton variant="text" className="h-8 w-2/3" />
            <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
            <Skeleton variant="rect" className="h-32 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
              <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
            </div>
            <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
            <Skeleton variant="rect" className="h-40 w-full rounded-lg" />
            <Skeleton variant="rect" className="h-40 w-full rounded-lg" />
            <Skeleton variant="rect" className="h-12 w-full rounded-lg" />
          </div>
        }
      >
        <CreateProductPageClient />
      </Suspense>
    </div>
  );
}
