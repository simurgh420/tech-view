'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAdminComments } from '@/hooks/useAdmin/useAdminComments';
import { DeleteCommentModal } from './DeleteCommentModal';

export function CommentsList() {
  const { comments, isLoading } = useAdminComments();

  if (isLoading) return <p>در حال بارگذاری...</p>;

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
