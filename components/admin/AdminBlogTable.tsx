'use client';

import Link from 'next/link';
import { FileText, MessageSquareText, PencilLine, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatAdminDate } from '@/lib/admin-date';
import { useGetAdminBlogs, useDeleteBlog } from '@/hooks/useBlogs';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useNotify } from '@/hooks/useNotify';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminBlogTable() {
  const { data: posts = [], isLoading, isError } = useGetAdminBlogs();
  const { data: comments = [] } = useGetAdminComments();
  const { mutate: deleteBlog, isPending: isDeleting } = useDeleteBlog();
  const { mutate: deleteComment, isPending: isDeletingComment } = useDeleteAdminComment();
  const notify = useNotify();

  const handleDelete = (slug: string) => {
    deleteBlog(slug, {
      onSuccess: () => {
        notify.success('پست با موفقیت حذف شد ✅');
      },
      onError: () => {
        notify.error('خطا در حذف پست ❌');
      },
    });
  };

  const handleDeleteComment = (commentId: string) => {
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
    <Card className="overflow-hidden border-border/60  shadow-sm" dir="rtl">
      <CardHeader className="border-b border-border/60  px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">مدیریت پست‌ها</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                فهرست پست‌های منتشرشده و پیش‌نویس را مدیریت کنید.
              </p>
            </div>
          </div>

          <Button asChild size="sm" className="gap-2">
            <Link href="/blog/create">
              <Plus className="size-4" />
              پست جدید
            </Link>
          </Button>
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
            خطا در دریافت پست‌ها. لطفاً دوباره تلاش کنید.
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            هیچ پستی برای نمایش وجود ندارد.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 text-right">پست</TableHead>
                <TableHead className="px-4 py-3 text-right">وضعیت</TableHead>
                <TableHead className="px-4 py-3 text-right">نویسنده</TableHead>
                <TableHead className="px-4 py-3 text-right">تاریخ</TableHead>
                <TableHead className="px-4 py-3 text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map(post => {
                const postComments = comments.filter(comment => comment.post?.slug === post.slug);
                const hasComments = postComments.length > 0;

                return (
                  <TableRow key={post.id}>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex items-center justify-start gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
                          {post.coverImageUrl ? (
                            <Image
                              src={post.coverImageUrl}
                              alt={post.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                              بدون کاور
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {post.title}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {post.status === 'PUBLISHED' ? 'منتشر شده' : 'پیش‌نویس'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div
                          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full
                        bg-muted text-sm font-semibold text-muted-foreground"
                        >
                          {post.author?.image ? (
                            <Image
                              src={post.author.image}
                              alt={post.author.name ?? 'کاربر'}
                              width={32}
                              height={32}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-muted-foreground">
                              {post.author?.name?.charAt(0) ?? '—'}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      {formatAdminDate(post.publishedAt ?? post.updatedAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              disabled={!hasComments}
                            >
                              <MessageSquareText className="size-4" />
                              نظرات
                              {hasComments && (
                                <span className="rounded-full bg-primary/10 px-1.5 text-xs text-primary">
                                  {postComments.length}
                                </span>
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl" dir="rtl">
                            <DialogHeader className="pt-2">
                              <DialogTitle className="text-right">
                                نظرات پست «{post.title}»
                              </DialogTitle>
                              <DialogDescription className="text-right">
                                مدیریت دیدگاه های بلاگ
                              </DialogDescription>
                            </DialogHeader>

                            <div className="max-h-[60vh] space-y-3 overflow-y-auto">
                              {postComments.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                                  هنوز نظری برای این پست ثبت نشده است.
                                </div>
                              ) : (
                                postComments.map(comment => (
                                  <div
                                    key={comment.id}
                                    className="rounded-lg border bg-muted/30 p-4"
                                  >
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
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
                                        <span className="font-medium">
                                          {comment.author?.name ?? 'کاربر'}
                                        </span>
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {formatAdminDate(comment.createdAt)}
                                      </span>
                                    </div>
                                    <div className="flex items-start justify-between gap-4">
                                      <p className="text-sm leading-6 text-foreground">
                                        {comment.content}
                                      </p>
                                      <ConfirmDialog
                                        trigger={
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            className="gap-2"
                                            disabled={isDeletingComment}
                                          >
                                            <Trash2 className="size-4" />
                                            حذف
                                          </Button>
                                        }
                                        title="حذف کامنت"
                                        description="آیا مطمئن هستید می‌خواهید این کامنت را حذف کنید؟"
                                        confirmText="بله، حذف کن"
                                        cancelText="لغو"
                                        onConfirm={() => handleDeleteComment(comment.id)}
                                      />
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button asChild variant="ghost" size="sm" className="gap-2">
                          <Link href={`/blog/edit/${post.slug}`}>
                            <PencilLine className="size-4" />
                            ویرایش
                          </Link>
                        </Button>

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
                          title="حذف پست"
                          description={`آیا مطمئن هستید می‌خواهید «${post.title}» را حذف کنید؟ این عملیات قابل بازگشت نیست.`}
                          confirmText="بله، حذف کن"
                          cancelText="لغو"
                          onConfirm={() => handleDelete(post.slug)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
