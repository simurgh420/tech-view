'use client';
import { useComments } from '@/hooks/useComments';
import { CommentSafe } from '@/services/comments/queries';
import Image from 'next/image';
import { CommentForm } from '@/components/sections/comments/CommentForm';
import { Button } from '@/components/ui';

export function CommentsSection({ postId }: { postId: string }) {
  const { comments, isLoading, likeComment, dislikeComment } = useComments(postId);

  if (isLoading) return <p>در حال بارگذاری...</p>;

  return (
    <div className="mt-10 " dir="auto">
      <h3 className="text-lg font-semibold mb-4">💬 کامنت‌ها</h3>

      {/* لیست کامنت‌ها */}
      <ul className="space-y-6 mt-6">
        {comments?.map((c: CommentSafe) => (
          <li key={c.id} className="p-4 border rounded-xl shadow-sm bg-white">
            {/* اطلاعات کاربر */}
            <div className="flex items-center gap-3 mb-2">
              {c.avatar && (
                <Image
                  src={c.avatar}
                  alt={c.author}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div className="flex flex-col">
                <span className="font-bold">{c.author}</span>
                <span className="text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString('fa-IR')}
                </span>
              </div>
              <div className="ml-auto text-sm font-semibold text-yellow-600">
                ★ {c.rating.toFixed(1)}
              </div>
            </div>

            {/* متن کامنت */}
            <p className="text-sm leading-6 text-gray-800">{c.content}</p>

            {/* ری‌اکشن‌ها */}
            <div className="flex items-center gap-6 mt-3 text-xs text-gray-500">
              <Button
                onClick={() => likeComment.mutate(c.id)}
                className="flex items-center gap-1 hover:text-red-500 transition-colors"
              >
                ❤️ {c.likes}
              </Button>
              <Button
                onClick={() => dislikeComment.mutate(c.id)}
                className="flex items-center gap-1 hover:text-red-500 transition-colors"
              >
                👎 {c.dislikes}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {/* فرم ارسال کامنت */}
      <div className="mt-10">
        <CommentForm postId={postId} />
      </div>
    </div>
  );
}
