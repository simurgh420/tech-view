// components/sections/product-comments/ProductCommentsSection.tsx

'use client';

import { useProductComments } from '@/hooks/useProductComments';

import { Skeleton } from '@/components/ui/skeleton';

import { ProductCommentForm } from './ProductCommentForm';
import { ProductCommentItem } from './ProductCommentItem';

type Props = {
  productSlug: string;
};

export function ProductCommentsSection({ productSlug }: Props) {
  const { useGetComments } = useProductComments(productSlug);

  const { data: comments = [], isLoading, isError } = useGetComments();

  if (isLoading) {
    return (
      <section
        dir="rtl"
        className="
          mt-10
          space-y-6
        "
      >
        <Skeleton className="h-6 w-40" />

        <Skeleton
          className="
            h-20
            w-full
            rounded-xl
          "
        />

        <Skeleton
          className="
            h-16
            w-full
            rounded-xl
          "
        />

        <Skeleton
          className="
            h-16
            w-full
            rounded-xl
          "
        />
      </section>
    );
  }

  if (isError) {
    return (
      <section dir="rtl" className="mt-10">
        <p
          className="
            text-sm
            text-destructive
          "
        >
          خطا در دریافت دیدگاه‌ها.
        </p>
      </section>
    );
  }

  return (
    <section
      dir="rtl"
      className="
        mt-10
        space-y-6
      "
    >
      <h2
        className="
          text-lg
          font-semibold
        "
      >
        💬 دیدگاه‌ها
      </h2>

      <ProductCommentForm productSlug={productSlug} />

      {comments.length === 0 ? (
        <p
          className="
              text-sm
              text-muted-foreground
            "
        >
          هنوز دیدگاهی ثبت نشده است.
        </p>
      ) : (
        <div
          className="
              space-y-5
            "
        >
          {comments.map(comment => (
            <ProductCommentItem key={comment.id} comment={comment} productSlug={productSlug} />
          ))}
        </div>
      )}
    </section>
  );
}
