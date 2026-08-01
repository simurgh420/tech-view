'use client';

import Link from 'next/link';
import { MessageSquareQuote, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatAdminDate } from '@/lib/admin-date';
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
import { useQuery } from '@tanstack/react-query';
import { fetchAdminReviewsApi } from '@/services/reviews/api/queries';
import type { AdminReviewItem } from '@/types/review';
import { adminReviewKeys } from '@/hooks/useReviews';

export function AdminReviewTable() {
  const {
    data: reviews = [],
    isLoading,
    isError,
  } = useQuery<AdminReviewItem[]>({
    queryKey: adminReviewKeys.all,
    queryFn: fetchAdminReviewsApi,
  });
  const notify = useNotify();

  const handleDelete = () => {
    notify.success('حذف دیدگاه در این نسخه در دسترس نیست');
  };

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 shadow-sm" dir="rtl">
      <CardHeader className="border-b border-border/60 bg-muted/40 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <MessageSquareQuote className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">مدیریت نظرات محصولات</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              بازبینی نظرات ثبت‌شده کاربران در صفحه محصولات.
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
            خطا در دریافت نظرات. لطفاً دوباره تلاش کنید.
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            هیچ نظری برای نمایش وجود ندارد.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 text-right">عنوان</TableHead>
                <TableHead className="px-4 py-3 text-right">محصول</TableHead>
                <TableHead className="px-4 py-3 text-right">نظر‌دهنده</TableHead>
                <TableHead className="px-4 py-3 text-right">تاریخ</TableHead>
                <TableHead className="px-4 py-3 text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map(review => (
                <TableRow key={review.id}>
                  <TableCell className="px-4 py-3 text-right">{review.title ?? '—'}</TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    {review.product ? (
                      <Link
                        href={`/products/${review.product.slug}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {review.product.title}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
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
                      <span>{review.user?.name ?? '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    {formatAdminDate(review.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <ConfirmDialog
                      trigger={
                        <Button variant="destructive" size="sm" className="gap-2">
                          <Trash2 className="size-4" />
                          حذف
                        </Button>
                      }
                      title="حذف دیدگاه"
                      description="آیا مطمئن هستید می‌خواهید این دیدگاه را حذف کنید؟"
                      confirmText="بله، حذف کن"
                      cancelText="لغو"
                      onConfirm={() => handleDelete()}
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
