'use client';

import Link from 'next/link';
import { PackageOpen, PencilLine, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatAdminDate } from '@/lib/admin-date';
import { formatPrice } from '@/lib/formatPrice';
import { adminProductKeys, useDeleteProduct } from '@/hooks/useProducts';
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
import { fetchAdminProductsApi } from '@/services/products/api/queries';
import type { AdminProductItem } from '@/types/product';

export function AdminProductTable() {
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<AdminProductItem[]>({
    queryKey: adminProductKeys.all,
    queryFn: fetchAdminProductsApi,
  });
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
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

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 shadow-sm" dir="rtl">
      <CardHeader className="border-b border-border/60 bg-muted/40 px-6 py-5">
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
              {products.map(product => (
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
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
