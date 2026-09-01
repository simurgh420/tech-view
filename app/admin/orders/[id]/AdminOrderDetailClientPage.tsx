// app/admin/orders/[id]/AdminOrderDetailClientPage.tsx
'use client';

import { CalendarDays, Mail, MapPin, Package, Phone, User } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
import { formatAdminDate } from '@/lib/admin-date';
import { useGetAdminOrderById, useUpdateOrderStatus } from '@/hooks/useOrders';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotify } from '@/hooks/useNotify';
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';

const statusOptions = [
  { value: 'PENDING', label: 'در انتظار پرداخت' },
  { value: 'PAID', label: 'پرداخت شده' },
  { value: 'SHIPPED', label: 'ارسال شده' },
  { value: 'DELIVERED', label: 'تحویل شده' },
  { value: 'CANCELED', label: 'لغو شده' },
];

type Props = { orderId: string };

export default function AdminOrderDetailClientPage({ orderId }: Props) {
  const { data: order, isPending, isError } = useGetAdminOrderById(orderId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
  const notify = useNotify();

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-12 text-center">
        سفارش پیدا نشد.
      </div>
    );
  }

  const handleStatusChange = (status: string) => {
    updateStatus(
      { orderId, status },
      {
        onSuccess: () => notify.success('وضعیت سفارش به‌روزرسانی شد ✅'),
        onError: () => notify.error('خطا در تغییر وضعیت ❌'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">سفارش #{order.id.slice(-8).toUpperCase()}</h1>
        <Select value={order.status} onValueChange={handleStatusChange} disabled={isUpdating}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* مشتری */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4.5 text-primary" />
            اطلاعات مشتری
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="size-4" />
            {order.user?.name ?? '—'}
          </div>
          <div className="flex items-center gap-2">
            <Mail className="size-4" />
            <span dir="ltr">{order.user?.email ?? '—'}</span>
          </div>
          {order.user?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="size-4" />
              <span dir="ltr">{order.user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            {formatAdminDate(order.createdAt)}
          </div>
        </CardContent>
      </Card>

      {/* آیتم‌ها */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="size-4.5 text-primary" />
            اقلام سفارش
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {order.items.map(
              (item: {
                id: Key | null | undefined;
                title:
                  | string
                  | number
                  | bigint
                  | boolean
                  | ReactElement<unknown, string | JSXElementConstructor<any>>
                  | Iterable<ReactNode>
                  | ReactPortal
                  | Promise<
                      | string
                      | number
                      | bigint
                      | boolean
                      | ReactPortal
                      | ReactElement<unknown, string | JSXElementConstructor<any>>
                      | Iterable<ReactNode>
                      | null
                      | undefined
                    >
                  | null
                  | undefined;
                quantity: number;
                price: number;
              }) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.quantity.toLocaleString('fa-IR')} عدد ×{' '}
                      {formatPrice(item.price, 'fa-IR')} تومان
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatPrice(item.price * item.quantity, 'fa-IR')} تومان
                  </p>
                </div>
              )
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-sm font-medium text-muted-foreground">مبلغ کل</span>
            <span className="text-lg font-bold">
              {formatPrice(Number(order.total), 'fa-IR')} تومان
            </span>
          </div>
        </CardContent>
      </Card>

      {/* آدرس */}
      {order.address && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4.5 text-primary" />
              آدرس ارسال
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>{order.address.fullName}</div>
            <div dir="ltr">{order.address.phone}</div>
            <div>
              {order.address.city}، {order.address.address} (کد پستی: {order.address.postalCode})
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
