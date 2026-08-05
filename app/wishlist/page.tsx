// app/wishlist/page.tsx
import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { fetchWishlistApi } from '@/services/wishlist/api/queries';
import { getQueryClient } from '@/lib/query/query-client';
import { wishlistKeys } from '@/hooks/useWishlist';
import WishlistError from './WishlistError';
import { WishlistSkeleton } from '@/components/sections/wishlist/WishlistSkeleton';
import { WishlistPageClient } from './WishlistPageClient';

export default async function WishlistPage() {
  const queryClient = getQueryClient();

  // Prefetch لیست ویش‌لیست
  await queryClient.prefetchQuery({
    queryKey: wishlistKeys.all,
    queryFn: fetchWishlistApi,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WishlistError>
        <Suspense fallback={<WishlistSkeleton />}>
          <div className="container mx-auto max-w-6xl px-4 py-12 space-y-8" dir="rtl">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <span className="text-red-500">❤️</span> علاقه‌مندی‌های من
              </h1>
              <p className="text-muted-foreground">
                محصولاتی که ذخیره کرده‌اید اینجا قابل مشاهده هستند.
              </p>
            </div>
            <WishlistPageClient />
          </div>
        </Suspense>
      </WishlistError>
    </HydrationBoundary>
  );
}
