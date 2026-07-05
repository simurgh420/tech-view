// components/sections/product-comments/ProductCommentsSection.tsx
'use client';

import { useProductComments } from '@/hooks/useProductComments';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCommentForm } from './ProductCommentForm';
import { ProductCommentItem } from './ProductCommentItem';

export function ProductCommentsSection({ productSlug }: { productSlug: string }) {
  const { useGetComments } = useProductComments(productSlug);
  const { data: comments = [], isLoading, isError } = useGetComments();

  if (isLoading) {
    return (
      <div className="mt-10 space-y-6" dir="rtl">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="mt-10 text-sm text-destructive" dir="rtl">
        خطا در دریافت دیدگاه‌ها.
      </p>
    );
  }

  return (
    <div className="mt-10 space-y-6" dir="rtl">
      <h3 className="text-lg font-semibold">💬 دیدگاه‌ها</h3>

      <ProductCommentForm productSlug={productSlug} />

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">هنوز دیدگاهی ثبت نشده است.</p>
      ) : (
        <div className="space-y-5">
          {comments.map(comment => (
            <ProductCommentItem key={comment.id} comment={comment} productSlug={productSlug} />
          ))}
        </div>
      )}
    </div>
  );
}
