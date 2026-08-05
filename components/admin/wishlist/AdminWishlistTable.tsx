// components/admin/AdminWishlistTable.tsx (نسخه اصلاح‌شده)
'use client';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Heart } from 'lucide-react';
import { formatAdminDate } from '@/lib/admin-date';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AdminWishlistItem } from '@/types/wishlist';

interface Props {
  items: AdminWishlistItem[];
  isLoading: boolean;
  isError: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function AdminWishlistTable({ items, isLoading, isError, onDelete, isDeleting }: Props) {
  return (
    <Card className="overflow-hidden border-border/60 shadow-sm" dir="rtl">
      <CardHeader className="border-b border-border/60 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-pink-500/10 p-2 text-pink-600">
            <Heart className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">آیتم‌های علاقه‌مندی</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              تمام محصولات ذخیره‌شده توسط کاربران در اینجا نمایش داده می‌شود.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-6">
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            هیچ آیتمی در لیست علاقه‌مندی وجود ندارد.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 text-right">کاربر</TableHead>
                <TableHead className="px-4 py-3 text-right">محصول</TableHead>
                <TableHead className="px-4 py-3 text-right">تاریخ افزودن</TableHead>
                <TableHead className="px-4 py-3 text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex items-center justify-start gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                        {item.user?.image ? (
                          <Image
                            src={item.user.image}
                            alt={item.user?.name ?? 'کاربر'}
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{item.user?.name?.charAt(0) ?? '—'}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{item.user?.name ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">{item.user?.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <span className="font-medium">{item.product?.title ?? 'محصول نامشخص'}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    {formatAdminDate(item.createdAt)}
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
                      title="حذف از علاقه‌مندی"
                      description="آیا مطمئن هستید می‌خواهید این آیتم را حذف کنید؟"
                      confirmText="بله، حذف کن"
                      cancelText="لغو"
                      onConfirm={() => onDelete(item.id)}
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
