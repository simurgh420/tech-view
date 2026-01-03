// components/sections/comments/CommentsSection.tsx
'use client';

import { useComments } from '@/hooks/useComments';
import Image from 'next/image';
import { CommentForm } from './CommentForm';

export function CommentsSection({ postId }: { postId: string }) {
  const { comments, isLoading, error } = useComments(postId);

  if (isLoading) return <p>در حال بارگذاری...</p>;
  if (error) return <p>خطا در گرفتن کامنت‌ها</p>;

  return (
    <div className="mt-10" dir="rtl">
      <h3 className="text-lg font-semibold mb-4">💬 کامنت‌ها</h3>

      <ul className="space-y-6 mt-6">
        {comments.map(c => (
          <li key={c.id} className="p-4 border rounded-xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-2">
              {c.authorImage && (
                <Image
                  src={c.authorImage}
                  alt={c.authorName ?? 'کاربر'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}

              <div className="flex flex-col">
                <span className="font-bold">{c.authorName ?? 'کاربر ناشناس'}</span>
                <span className="text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString('fa-IR')}
                </span>
              </div>

              <div className="mr-auto text-sm font-semibold text-yellow-600">
                ★ {c.rating.toFixed(1)}
              </div>
            </div>

            <p className="text-sm leading-6 text-gray-800">{c.content}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <CommentForm postId={postId} />
      </div>
    </div>
  );
}
