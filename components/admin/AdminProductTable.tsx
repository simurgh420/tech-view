'use client';

import Link from 'next/link';
import { MessageSquareText, PackageOpen, PencilLine, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatAdminDate } from '@/lib/admin-date';
import { formatPrice } from '@/lib/formatPrice';
import { useDeleteProduct, useGetAdminProducts } from '@/hooks/useProducts';
import { useDeleteReview, useGetAdminReviews } from '@/hooks/useReviews';
import {
  useDeleteAdminProductComment,
  useGetAdminProductComments,
} from '@/hooks/useProductComments';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const commentStatusLabel: Record<string, string> = {
  APPROVED: 'تأیید شده',
  PENDING: 'در انتظار تأیید',
  REJECTED: 'رد شده',
};

export function AdminProductTable() {
  const { data: products = [], isLoading, isError } = useGetAdminProducts();
  const { data: reviews = [] } = useGetAdminReviews();
  const { data: comments = [] } = useGetAdminProductComments();

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { mutate: deleteReview, isPending: isDeletingReview } = useDeleteReview('');
  const { mutate: deleteComment, isPending: isDeletingComment } = useDeleteAdminProductComment();
  const notify = useNotify();

  const handleDelete = (slug: string) => {
    deleteProduct(slug, {
      onSuccess: () => {
        notify.success('محصول با موفقیت حذف شد ✅');
      },
      onError: () => {
        notify.error('خطا در حذف محصول ❌');
      },
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    deleteReview(reviewId, {
      onSuccess: () => {
        notify.success('بازخورد با موفقیت حذف شد ✅');
      },
      onError: () => {
        notify.error('خطا در حذف بازخورد ❌');
      },
    });
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId, {
      onSuccess: () => {
        notify.success('دیدگاه با موفقیت حذف شد ✅');
      },
      onError: () => {
        notify.error('خطا در حذف دیدگاه ❌');
      },
    });
  };

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm" dir="rtl">
      <CardHeader className="border-b border-border/60 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <PackageOpen className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">مدیریت محصولات</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                فهرست محصولات را مشاهده و مدیریت کنید.
              </p>
            </div>
          </div>

          <Button asChild size="sm" className="gap-2">
            <Link href="/products/create">
              <Plus className="size-4" />
              محصول جدید
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
            خطا در دریافت محصولات. لطفاً دوباره تلاش کنید.
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            هیچ محصولی برای نمایش وجود ندارد.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 text-right">محصول</TableHead>
                <TableHead className="px-4 py-3 text-right">دسته‌بندی</TableHead>
                <TableHead className="px-4 py-3 text-right">برند</TableHead>
                <TableHead className="px-4 py-3 text-right">قیمت</TableHead>
                <TableHead className="px-4 py-3 text-right">تاریخ</TableHead>
                <TableHead className="px-4 py-3 text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => {
                const productReviews = reviews.filter(
                  review => review.product?.slug === product.slug
                );
                const productComments = comments.filter(
                  comment => comment.product?.slug === product.slug
                );
                const totalFeedback = productReviews.length + productComments.length;

                return (
                  <TableRow key={product.id}>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex items-center justify-start gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
                          {product.thumbnail ? (
                            <Image
                              src={product.thumbnail}
                              alt={product.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                              بدون تصویر
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {product.title}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      {product.category?.title ?? '—'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      {product.brand?.name ?? '—'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      {formatPrice(Number(product.price.toString()), 'fa-IR')}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      {formatAdminDate(product.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              disabled={totalFeedback === 0}
                            >
                              <MessageSquareText className="size-4" />
                              بازخوردها
                              {totalFeedback > 0 && (
                                <span className="rounded-full bg-primary/10 px-1.5 text-xs text-primary">
                                  {totalFeedback}
                                </span>
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl" dir="rtl">
                            <DialogHeader className="pt-2">
                              <DialogTitle className="text-right tracking-wide">
                                بازخوردهای محصول «{product.title}»
                              </DialogTitle>
                              <DialogDescription className="text-right">
                                مدیریت بازخورده های محصولات
                              </DialogDescription>
                            </DialogHeader>

                            <Tabs defaultValue="reviews" dir="rtl">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="reviews" className="gap-2">
                                  ریویوها
                                  {productReviews.length > 0 && (
                                    <span className="rounded-full bg-muted px-1.5 text-xs">
                                      {productReviews.length}
                                    </span>
                                  )}
                                </TabsTrigger>
                                <TabsTrigger value="comments" className="gap-2">
                                  دیدگاه‌ها
                                  {productComments.length > 0 && (
                                    <span className="rounded-full bg-muted px-1.5 text-xs">
                                      {productComments.length}
                                    </span>
                                  )}
                                </TabsTrigger>
                              </TabsList>

                              {/* ───────── تب ریویوها ───────── */}
                              <TabsContent
                                value="reviews"
                                className="max-h-[60vh] space-y-3 overflow-y-auto"
                              >
                                {productReviews.length === 0 ? (
                                  <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                                    هنوز ریویویی برای این محصول ثبت نشده است.
                                  </div>
                                ) : (
                                  productReviews.map(review => (
                                    <div
                                      key={review.id}
                                      className="rounded-lg border bg-muted/30 p-3"
                                    >
                                      <div className="mb-2 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted">
                                            {review.user?.image ? (
                                              <Image
                                                src={review.user.image}
                                                alt={review.user.name ?? 'کاربر'}
                                                width={32}
                                                height={32}
                                                className="h-full w-full object-cover"
                                              />
                                            ) : (
                                              <span className="text-sm font-semibold text-muted-foreground">
                                                {review.user?.name?.charAt(0) ?? '؟'}
                                              </span>
                                            )}
                                          </div>
                                          <span className="font-medium">
                                            {review.user?.name ?? 'کاربر'}
                                          </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                          {formatAdminDate(review.createdAt)}
                                        </span>
                                      </div>
                                      <div className="mb-2 text-sm font-medium text-primary">
                                        {review.title ?? 'بدون عنوان'}
                                      </div>
                                      <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm leading-6 text-foreground">
                                          {review.content}
                                        </p>
                                        <ConfirmDialog
                                          trigger={
                                            <Button
                                              variant="destructive"
                                              size="sm"
                                              className="gap-2"
                                              disabled={isDeletingReview}
                                            >
                                              <Trash2 className="size-4" />
                                              حذف
                                            </Button>
                                          }
                                          title="حذف بازخورد"
                                          description="آیا مطمئن هستید می‌خواهید این بازخورد را حذف کنید؟"
                                          confirmText="بله، حذف کن"
                                          cancelText="لغو"
                                          onConfirm={() => handleDeleteReview(review.id)}
                                        />
                                      </div>
                                    </div>
                                  ))
                                )}
                              </TabsContent>

                              {/* ───────── تب دیدگاه‌ها ───────── */}
                              <TabsContent
                                value="comments"
                                className="max-h-[60vh] space-y-3 overflow-y-auto"
                              >
                                {productComments.length === 0 ? (
                                  <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                                    هنوز دیدگاهی برای این محصول ثبت نشده است.
                                  </div>
                                ) : (
                                  productComments.map(comment => (
                                    <div
                                      key={comment.id}
                                      className="rounded-lg border bg-muted/30 p-3"
                                      style={{
                                        marginRight: comment.depth ? comment.depth * 16 : 0,
                                      }}
                                    >
                                      <div className="mb-2 flex items-center justify-between gap-2">
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
                                          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                                            {commentStatusLabel[comment.status] ?? comment.status}
                                          </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                          {formatAdminDate(comment.createdAt)}
                                        </span>
                                      </div>
                                      <div className="flex items-start justify-between gap-3">
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
                                          title="حذف دیدگاه"
                                          description="آیا مطمئن هستید می‌خواهید این دیدگاه را حذف کنید؟"
                                          confirmText="بله، حذف کن"
                                          cancelText="لغو"
                                          onConfirm={() => handleDeleteComment(comment.id)}
                                        />
                                      </div>
                                    </div>
                                  ))
                                )}
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>

                        <Button asChild variant="ghost" size="sm" className="gap-2">
                          <Link href={`/products/edit/${product.slug}`}>
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
                          title="حذف محصول"
                          description={`آیا مطمئن هستید می‌خواهید «${product.title}» را حذف کنید؟ این عملیات قابل بازگشت نیست.`}
                          confirmText="بله، حذف کن"
                          cancelText="لغو"
                          onConfirm={() => handleDelete(product.slug)}
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
