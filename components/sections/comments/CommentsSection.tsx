// components/sections/comments/CommentsSection.tsx
'use client';

import { useComments } from '@/hooks/useComments';
import Image from 'next/image';
import { CommentForm } from './CommentForm';

export function CommentsSection({ postId }: { postId: string }) {
  const { useGetComments } = useComments(postId);
  const { data: comments = [], isLoading, error } = useGetComments();

  if (isLoading) return <p className="p-4">در حال بارگذاری کامنت‌ها...</p>;
  if (error) return <p className="p-4 text-red-500">خطا در دریافت کامنت‌ها</p>;

  return (
    <div className="mt-10" dir="rtl">
      <h3 className="text-lg font-semibold mb-4">💬 کامنت‌ها</h3>

      {comments.length === 0 ? (
        <p className="text-gray-500">هنوز کامنتی ثبت نشده است.</p>
      ) : (
        <ul className="space-y-6 mt-6">
          {comments.map(c => (
            <li key={c.id} className="p-4 border rounded-xl shadow-sm">
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
              <p className="text-sm leading-6 text-gray-700">{c.content}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10">
        <CommentForm postId={postId} />
      </div>
    </div>
  );
}
