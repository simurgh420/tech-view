// components/sections/reviews/ReviewsSection.tsx
'use client';

import { useReviews } from '@/hooks/useReviews';
import { useSession } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRatingDisplay } from '@/components/ui/star-rating-input';
import { DeleteReviewModal } from './DeleteReviewModal';
import { ReviewForm } from './ReviewForm';
import Image from 'next/image';

export function ReviewsSection({ productSlug }: { productSlug: string }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { useGetReviews } = useReviews(productSlug);
  const { data: reviews = [], isLoading, isError } = useGetReviews();

  return (
    <div className="mt-10 space-y-6" dir="rtl">
      <h3 className="text-lg font-semibold">⭐ نظرات کاربران</h3>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border p-6">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">خطا در دریافت نظرات. لطفاً دوباره تلاش کنید.</p>
      )}

      {!isLoading && reviews.length === 0 && (
        <p className="text-sm text-muted-foreground">هنوز نظری برای این محصول ثبت نشده است.</p>
      )}

      <div className="space-y-4">
        {reviews.map(review => (
          <Card key={review.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-3">
                  {review.user?.image ? (
                    <Image
                      src={review.user.image}
                      alt={review.user.name}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {review.user?.name?.charAt(0) ?? '؟'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{review.user?.name ?? 'کاربر مهمان'}</p>
                    <StarRatingDisplay value={review.rating} />
                  </div>
                </div>
                <span className="text-xs font-normal text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString('fa-IR')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {review.title && <p className="mb-1 text-sm font-semibold">{review.title}</p>}
              <p className="text-sm leading-7 text-muted-foreground">{review.content}</p>

              {userId && review.authorId === userId && (
                <div className="mt-3 flex justify-end">
                  <DeleteReviewModal reviewId={review.id} productSlug={productSlug} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4">
        <ReviewForm productSlug={productSlug} />
      </div>
    </div>
  );
}
