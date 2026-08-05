// components/wishlist/WishlistPageClient.tsx
'use client';

import { useGetWishlist } from '@/hooks/useWishlist';
import { useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useNotify } from '@/hooks/useNotify';
import { Button } from '@/components/ui/button';
import { HeartCrack } from 'lucide-react';
import Link from 'next/link';
import { WishlistItemCard } from '@/components/sections/wishlist/WishlistItemCard';

export function WishlistPageClient() {
  const { data: items = [], isLoading, isError } = useGetWishlist();
  const { mutate: removeItem, isPending } = useRemoveFromWishlist();
  const notify = useNotify();

  const handleRemove = (id: string) => {
    removeItem(id, {
      onSuccess: () => notify.success('محصول از علاقه‌مندی‌ها حذف شد'),
      onError: () => notify.error('خطا در حذف محصول'),
    });
  };

  if (isLoading) {
    // در این ساختار لودینگ توسط Suspense مدیریت می‌شود،
    // اما اگر خواستید می‌توانید یک حالت لودینگ پیش‌فرض هم بگذارید.
    return null; // یا اسکلتون، ولی Suspense بهتر است
  }

  if (isError) {
    throw new Error('Failed to fetch wishlist'); // توسط ErrorBoundary گرفته می‌شود
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
        <HeartCrack className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">هنوز هیچ محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید.</p>
        <Button asChild variant="outline">
          <Link href="/products">مشاهده محصولات</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map(item => (
        <WishlistItemCard
          key={item.id}
          item={item}
          onRemove={() => handleRemove(item.id)}
          isRemoving={isPending}
        />
      ))}
    </div>
  );
}
