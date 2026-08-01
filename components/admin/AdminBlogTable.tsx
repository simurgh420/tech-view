'use client';

import Link from 'next/link';
import { FileText, PencilLine, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatAdminDate } from '@/lib/admin-date';
import { useGetAdminBlogs, useDeleteBlog } from '@/hooks/useBlogs';
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

export function AdminBlogTable() {
  const { data: posts = [], isLoading, isError } = useGetAdminBlogs();
  const { mutate: deleteBlog, isPending: isDeleting } = useDeleteBlog();
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

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 shadow-sm" dir="rtl">
      <CardHeader className="border-b border-border/60 bg-muted/40 px-6 py-5">
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
              {posts.map(post => (
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
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                        {post.author?.name?.charAt(0) ?? '؟'}
                      </div>
                      <span>{post.author?.name ?? '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    {formatAdminDate(post.publishedAt ?? post.updatedAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
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
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
