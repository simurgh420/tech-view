// app/orders/[id]/OrderDetailClientPage.tsx
'use client';

import Link from 'next/link';
import { CalendarDays, ChevronRight, MapPin, Package, Phone, User } from 'lucide-react';

import { useGetOrderById } from '@/hooks/useOrders';
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';

type OrderStatus = {
  label: string;
  className: string;
};

const statusMap: Record<string, OrderStatus> = {
  PENDING: {
    label: 'در انتظار پرداخت',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  PAID: {
    label: 'پرداخت شده',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  PROCESSING: {
    label: 'در حال پردازش',
    className: 'bg-primary/10 text-primary',
  },
  SHIPPED: {
    label: 'ارسال شده',
    className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  DELIVERED: {
    label: 'تحویل شده',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  CANCELLED: {
    label: 'لغو شده',
    className: 'bg-destructive/10 text-destructive',
  },
};

function getOrderStatus(status: string): OrderStatus {
  return (
    statusMap[status] ?? {
      label: status,
      className: 'bg-muted text-muted-foreground',
    }
  );
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

type Props = {
  orderId: string;
};

export default function OrderDetailClientPage({ orderId }: Props) {
  const { data: order, isPending, isError, error } = useGetOrderById(orderId);

  if (isPending) {
    return (
      <main dir="rtl" className="container mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <OrderDetailSkeleton />
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main dir="rtl" className="container mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-12 text-center">
          <h2 className="font-semibold">دریافت سفارش با خطا مواجه شد</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'سفارش مورد نظر پیدا نشد.'}
          </p>
        </section>
      </main>
    );
  }

  const status = getOrderStatus(order.status);
  const total = Number(order.total);

  return (
    <main dir="rtl" className="container mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/orders"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight className="size-4" />
          بازگشت به سفارش‌ها
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              سفارش #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />
              {formatDate(order.createdAt)}
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-4 py-1.5 text-sm font-medium ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* لیست آیتم‌ها */}
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
            <Package className="size-4.5 text-primary" />
            اقلام سفارش
          </h2>

          <div className="divide-y">
            {order.items.map((item: { id: Key | null | undefined; title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; quantity: number; price: number; }) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.quantity.toLocaleString('fa-IR')} عدد × {formatPrice(item.price)} تومان
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold">
                  {formatPrice(item.price * item.quantity)}
                  <span className="mr-1 text-xs font-normal text-muted-foreground">تومان</span>
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-sm font-medium text-muted-foreground">مبلغ کل</span>
            <span className="text-lg font-bold">
              {formatPrice(total)}
              <span className="mr-1 text-xs font-normal text-muted-foreground">تومان</span>
            </span>
          </div>
        </section>

        {/* آدرس ارسال */}
        {order.address && (
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
              <MapPin className="size-4.5 text-primary" />
              آدرس ارسال
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="size-4 shrink-0" />
                <span>{order.address.fullName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <span dir="ltr">{order.address.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="size-4 shrink-0 mt-0.5" />
                <span>
                  {order.address.city}، {order.address.address}
                  <span className="mr-1">(کد پستی: {order.address.postalCode})</span>
                </span>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-8 w-64 rounded bg-muted" />
      </div>
      <div className="rounded-2xl border bg-card p-5">
        <div className="mb-4 h-5 w-32 rounded bg-muted" />
        <div className="space-y-3">
          <div className="h-12 rounded bg-muted" />
          <div className="h-12 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
