'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAdminComments } from '@/hooks/useAdmin/useAdminComments';
import { DeleteCommentModal } from './DeleteCommentModal';
import { Skeleton } from '@/components/ui/skeleton';

export function CommentsList() {
  const { comments, isLoading } = useAdminComments();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <Skeleton variant="text" className="h-8 w-2/3 mb-6" />
        <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
        <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
          <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton variant="rect" className="h-40 w-full rounded-lg" />
        <Skeleton variant="rect" className="h-40 w-full rounded-lg" />
        <Skeleton variant="rect" className="h-12 w-full rounded-lg" />
      </div>
    );
  }
  if (!comments || comments.length === 0) {
    return <p className="text-gray-500">هیچ کامنتی وجود ندارد.</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment: any) => (
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
