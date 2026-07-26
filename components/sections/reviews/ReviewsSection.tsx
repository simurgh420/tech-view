// components/sections/reviews/ReviewsSection.tsx

'use client';

import { useSession } from '@/lib/auth-client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Skeleton } from '@/components/ui/skeleton';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { DeleteReviewModal } from './DeleteReviewModal';
import { ReviewForm } from './ReviewForm';

import { StarRatingDisplay } from '@/components/ui/star-rating-input';
import { useGetReviews } from '@/hooks/useReviews';

type Props = {
  productSlug: string;
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('fa-IR');
}

export function ReviewsSection({ productSlug }: Props) {
  const { data: session } = useSession();

  const userId = session?.user?.id;

  const { data: reviews = [], isLoading, isError } = useGetReviews(productSlug);

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
        ⭐ بررسی کاربران
      </h2>

      {isLoading && (
        <div
          className="
            space-y-4
          "
        >
          {Array.from({
            length: 3,
          }).map((_, i) => (
            <div
              key={i}
              className="
                space-y-3

                rounded-xl

                border

                p-6
              "
            >
              <div
                className="
                  flex
                  justify-between
                "
              >
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
        <p
          className="
            text-sm
            text-destructive
          "
        >
          خطا در دریافت نظرات. لطفاً دوباره تلاش کنید.
        </p>
      )}

      {!isLoading && !isError && reviews.length === 0 && (
        <p
          className="
            text-sm
            text-muted-foreground
          "
        >
          هنوز نظری برای این محصول ثبت نشده است.
        </p>
      )}

      {!isLoading && !isError && (
        <div
          className="
            space-y-4
          "
        >
          {reviews.map(review => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle
                  className="
                    flex
                    items-center
                    justify-between

                    text-base
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <Avatar
                      className="
                        h-9
                        w-9
                      "
                    >
                      {review.user?.image && (
                        <AvatarImage src={review.user.image} alt={review.user.name ?? 'user'} />
                      )}

                      <AvatarFallback>{review.user?.name?.charAt(0) ?? '؟'}</AvatarFallback>
                    </Avatar>

                    <StarRatingDisplay value={review.rating} size={16} />
                  </div>

                  <span
                    className="
                      text-xs
                      font-normal
                      text-muted-foreground
                    "
                  >
                    {formatDate(review.createdAt)}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                {review.title && (
                  <p
                    className="
                      mb-1
                      text-sm
                      font-semibold
                    "
                  >
                    {review.title}
                  </p>
                )}

                <p
                  className="
                    text-sm
                    leading-7
                    text-muted-foreground
                  "
                >
                  {review.content}
                </p>

                {userId && review.authorId === userId && (
                  <div
                    className="
                      mt-3
                      flex
                      justify-end
                    "
                  >
                    <DeleteReviewModal reviewId={review.id} productSlug={productSlug} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="pt-4">
        <ReviewForm productSlug={productSlug} />
      </div>
    </section>
  );
}
