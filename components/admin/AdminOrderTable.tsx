// components/admin/AdminOrderTable.tsx
'use client';

import Link from 'next/link';
import { Eye, ShoppingBag } from 'lucide-react';
import { formatAdminDate } from '@/lib/admin-date';
import { formatPrice } from '@/lib/formatPrice';
import { useGetAdminOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotify } from '@/hooks/useNotify';
import { Key } from 'react';

const statusOptions = [
  { value: 'PENDING', label: 'در انتظار پرداخت' },
  { value: 'PAID', label: 'پرداخت شده' },
  { value: 'SHIPPED', label: 'ارسال شده' },
  { value: 'DELIVERED', label: 'تحویل شده' },
  { value: 'CANCELED', label: 'لغو شده' },
];

const statusClassMap: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  PAID: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  SHIPPED: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  DELIVERED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  CANCELED: 'bg-destructive/10 text-destructive',
};

export function AdminOrderTable() {
  const { data: orders = [], isLoading, isError } = useGetAdminOrders();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
  const notify = useNotify();

  const handleStatusChange = (orderId: string, status: string) => {
    updateStatus(
      { orderId, status },
      {
        onSuccess: () => notify.success('وضعیت سفارش به‌روزرسانی شد ✅'),
        onError: () => notify.error('خطا در تغییر وضعیت سفارش ❌'),
      }
    );
  };

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm" dir="rtl">
      <CardHeader className="border-b border-border/60 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <ShoppingBag className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">مدیریت سفارش‌ها</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              فهرست سفارش‌های ثبت‌شده و وضعیت آن‌ها را مدیریت کنید.
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
            خطا در دریافت سفارش‌ها. لطفاً دوباره تلاش کنید.
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            هیچ سفارشی برای نمایش وجود ندارد.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 text-right">سفارش</TableHead>
                <TableHead className="px-4 py-3 text-right">مشتری</TableHead>
                <TableHead className="px-4 py-3 text-right">مبلغ</TableHead>
                <TableHead className="px-4 py-3 text-right">وضعیت</TableHead>
                <TableHead className="px-4 py-3 text-right">تاریخ</TableHead>
                <TableHead className="px-4 py-3 text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(
                (order: {
                  id: Key | null | undefined;
                  user: { name: any; email: any };
                  total: any;
                  status: string | undefined;
                  createdAt: string | Date | null | undefined;
                }) => {
                  const orderId = String(order.id ?? '');

                  return (
                    <TableRow key={orderId || 'unknown-order'}>
                      <TableCell className="px-4 py-3 text-right font-medium">
                        #{orderId.slice(-8).toUpperCase() || 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="text-sm">{order.user?.name ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.user?.email ?? ''}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        {formatPrice(Number(order.total), 'fa-IR')} تومان
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <Select
                          value={order.status}
                          onValueChange={value => {
                            if (!order.id) return;
                            handleStatusChange(String(order.id), value);
                          }}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="h-8 w-40">
                            <SelectValue>
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  order.status
                                    ? (statusClassMap[order.status] ??
                                      'bg-muted text-muted-foreground')
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {statusOptions.find(s => s.value === order.status)?.label ??
                                  order.status ??
                                  'نامشخص'}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        {formatAdminDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          disabled={!order.id}
                        >
                          <Link href={order.id ? `/admin/orders/${String(order.id)}` : '#'}>
                            <Eye className="size-4" />
                            جزئیات
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
