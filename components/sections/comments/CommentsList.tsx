'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAdminComments } from '@/hooks/useAdmin/useAdminComments';
import { DeleteCommentModal } from './DeleteCommentModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotify } from '@/hooks/useNotify';
import { AdminComment } from '@/types/comment';

export function CommentsList() {
  const { comments, isLoading, isError, error } = useAdminComments();
  const notify = useNotify();

  // نمایش خطا در صورت وجود
  useEffect(() => {
    if (isError && error) {
      notify.error(
        error instanceof Error ? error.message : 'خطا در دریافت کامنت‌ها. لطفاً دوباره تلاش کنید.'
      );
    }
  }, [isError, error, notify]);

  // ---------- حالت بارگذاری ----------
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-xl p-6 space-y-3">
            <div className="flex justify-between">
              <Skeleton variant="text" className="h-4 w-32" />
              <Skeleton variant="text" className="h-3 w-24" />
            </div>
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-3 w-3/4" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton variant="rect" className="h-4 w-20 rounded" />
              <Skeleton variant="circle" width={24} height={24} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ---------- حالت خالی (بدون خطا) ----------
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        <p className="text-lg">هیچ کامنتی وجود ندارد.</p>
      </div>
    );
  }

  // ---------- نمایش کامنت‌ها ----------
  return (
    <div className="space-y-4">
      {comments.map((comment: AdminComment) => (
        <Card key={comment.id}>
          <CardHeader>
            <CardTitle className="text-base flex justify-between items-center">
              <span>{comment.author?.name ?? 'ناشناس'}</span>
              <span className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString('fa-IR')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-2">{comment.content}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <Link
                href={`/blog/${comment.post?.slug}`}
                className="text-blue-500 hover:underline"
                target="_blank"
              >
                {comment.post?.title ?? 'پست'}
              </Link>
              <div className="flex items-center gap-4">
                <span>امتیاز: {comment.rating}</span>
                <DeleteCommentModal commentId={comment.id} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
