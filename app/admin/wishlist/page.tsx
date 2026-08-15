// app/admin/wishlist/page.tsx
import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { fetchAdminWishlistApi } from '@/services/wishlist/api/admin';
import { getQueryClient } from '@/lib/query/query-client';
import { adminWishlistKeys } from '@/hooks/useAdmin/useAdminWishlist';
import { Heart } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { AdminWishlistTableSkeleton } from '@/components/admin/wishlist/AdminWishlistTableSkeleton';
import { AdminWishlistPageClient } from '@/components/admin/wishlist/AdminWishlistPageClient';

export default async function AdminWishlistPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: adminWishlistKeys.all,
    queryFn: fetchAdminWishlistApi,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container mx-auto max-w-7xl px-4 py-12 space-y-8" dir="rtl">
        <div className="space-y-4">
          <Breadcrumb />
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-pink-600" />
            مدیریت علاقه‌مندی‌ها
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            در این بخش می‌توانید تمام آیتم‌های ذخیره‌شده توسط کاربران را مشاهده و در صورت نیاز حذف
            کنید.
          </p>
          <div className="border-b pt-2" />
        </div>

        <Suspense fallback={<AdminWishlistTableSkeleton />}>
          <AdminWishlistPageClient />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}
