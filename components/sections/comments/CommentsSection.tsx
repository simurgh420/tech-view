// components/sections/comments/CommentsSection.tsx
'use client';

import Image from 'next/image';
import { CommentForm } from './CommentForm';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRatingDisplay } from '@/components/ui/star-rating-input';
import { useGetComments } from '@/hooks/useComments';

export function CommentsSection({ postId }: { postId: string }) {
  const { data: comments = [], isLoading, error } = useGetComments(postId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <Skeleton variant="text" className="mb-6 h-8 w-2/3" />
        <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
        <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton variant="rect" className="h-10 rounded-lg" />
          <Skeleton variant="rect" className="h-10 rounded-lg" />
        </div>
        <Skeleton variant="rect" className="h-40 rounded-lg" />
        <Skeleton variant="rect" className="h-40 rounded-lg" />
        <Skeleton variant="rect" className="h-12 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return <p className="p-4 text-red-500">خطا در دریافت کامنت‌ها</p>;
  }

  return (
    <section className="mt-10" dir="rtl">
      <h3 className="mb-6 text-xl font-bold">💬 کامنت‌ها</h3>

      {comments.length === 0 ? (
        <p className="text-muted-foreground">هنوز کامنتی ثبت نشده است.</p>
      ) : (
        <ul className="mt-6 space-y-5">
          {comments.map(comment => (
            <li
              key={comment.id}
              className="
                rounded-2xl
                border
                border-border
                p-5
                shadow-sm
                transition-shadow
                hover:shadow-md
              "
            >
              {/* Header */}
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {comment.authorImage && (
                    <Image
                      src={comment.authorImage}
                      alt={comment.authorName ?? 'کاربر'}
                      width={44}
                      height={44}
                      className="rounded-full object-cover"
                    />
                  )}

                  <div>
                    <h4 className="font-semibold text-foreground">
                      {comment.authorName ?? 'کاربر ناشناس'}
                    </h4>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                </div>

                <StarRatingDisplay value={comment.rating} size={16} />
              </div>

              {/* Comment */}
              <p className="text-sm leading-7 text-muted-foreground">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10">
        <CommentForm postId={postId} />
      </div>
    </section>
  );
}
