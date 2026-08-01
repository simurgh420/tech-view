'use client';

import Link from 'next/link';
import { FileText, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatAdminDate } from '@/lib/admin-date';
import { useDeleteAdminComment, useGetAdminComments } from '@/hooks/useAdmin/useAdminComments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useNotify } from '@/hooks/useNotify';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminCommentTable() {
  const { data: comments = [], isLoading, isError } = useGetAdminComments();
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteAdminComment();
  const notify = useNotify();

  const handleDelete = (commentId: string) => {
    deleteComment(commentId, {
      onSuccess: () => {
        notify.success('کامنت با موفقیت حذف شد ✅');
      },
      onError: () => {
        notify.error('خطا در حذف کامنت ❌');
      },
    });
  };

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 shadow-sm" dir="rtl">
      <CardHeader className="border-b border-border/60 bg-muted/40 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <FileText className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">مدیریت کامنت‌ها</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              نظرات کاربران را مشاهده و در صورت نیاز حذف کنید.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            خطا در دریافت کامنت‌ها. لطفاً دوباره تلاش کنید.
          </div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            هیچ کامنتی برای نمایش وجود ندارد.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 text-right">متن</TableHead>
                <TableHead className="px-4 py-3 text-right">نظر‌دهنده</TableHead>
                <TableHead className="px-4 py-3 text-right">پست</TableHead>
                <TableHead className="px-4 py-3 text-right">تاریخ</TableHead>
                <TableHead className="px-4 py-3 text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map(comment => (
                <TableRow key={comment.id}>
                  <TableCell className="px-4 py-3 text-right">
                    <p className="max-w-[320px] text-sm leading-6 text-foreground">
                      {comment.content}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted">
                        {comment.author?.image ? (
                          <Image
                            src={comment.author.image}
                            alt={comment.author.name ?? 'کاربر'}
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-muted-foreground">
                            {comment.author?.name?.charAt(0) ?? '؟'}
                          </span>
                        )}
                      </div>
                      <span>{comment.author?.name ?? '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    {comment.post ? (
                      <Link
                        href={`/blog/${comment.post.slug}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {comment.post.title}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    {formatAdminDate(comment.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          disabled={isDeleting}
                        >
                          <Trash2 className="size-4" />
                          حذف
                        </Button>
                      }
                      title="حذف کامنت"
                      description="آیا مطمئن هستید می‌خواهید این کامنت را حذف کنید؟ این عملیات قابل بازگشت نیست."
                      confirmText="بله، حذف کن"
                      cancelText="لغو"
                      onConfirm={() => handleDelete(comment.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
