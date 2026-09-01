'use client';

import Link from 'next/link';
import { CalendarDays, ChevronLeft, ClipboardList, Package, ShoppingBag } from 'lucide-react';

import { useGetUserOrders, useCancelOrder } from '@/hooks/useOrders';
import { useNotify } from '@/hooks/useNotify';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

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

  CANCELED: {
    // ✅ اصلاح شد: قبلاً CANCELLED (دو L) بود و هیچ‌وقت match نمی‌شد
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

// ✅ فقط سفارش‌هایی که هنوز ارسال نشدن قابل لغو هستن
function isCancelable(status: string) {
  return status === 'PENDING';
}

export default function OrdersPageClient() {
  const { data, isPending, isError, error } = useGetUserOrders();
  const { mutate: cancelOrder, isPending: isCanceling } = useCancelOrder();
  const notify = useNotify();

  const orders = Array.isArray(data) ? data : [];

  const handleCancel = (orderId: string) => {
    cancelOrder(orderId, {
      onSuccess: () => {
        notify.success('سفارش با موفقیت لغو شد ✅');
      },
      onError: (err: any) => {
        const message = err?.response?.data?.error ?? 'خطا در لغو سفارش';
        notify.error(message);
      },
    });
  };

  if (isPending) {
    return (
      <main dir="rtl" className="container mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <OrdersHeader />

        <OrdersSkeleton />
      </main>
    );
  }

  if (isError) {
    return (
      <main dir="rtl" className="container mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <OrdersHeader />

        <OrdersError
          message={error instanceof Error ? error.message : 'دریافت سفارش‌ها با خطا مواجه شد.'}
        />
      </main>
    );
  }

  if (!orders.length) {
    return (
      <main dir="rtl" className="container mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <OrdersHeader />

        <OrdersEmpty />
      </main>
    );
  }

  return (
    <main dir="rtl" className="container mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <OrdersHeader orderCount={orders.length} />

      <div className="space-y-4">
        {orders.map(order => {
          const status = getOrderStatus(order.status);

          return (
            <article
              key={order.id}
              className="group rounded-2xl border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-5"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                {/* Order information */}
                <div className="flex min-w-0 items-start gap-4">
                  <div className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
                    <Package className="size-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold sm:text-base">
                        سفارش #{order.id.slice(-8).toUpperCase()}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-4" />

                        {formatDate(order.createdAt)}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <ShoppingBag className="size-4" />

                        {order.itemsCount.toLocaleString('fa-IR')}

                        <span>محصول</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price + details */}
                <div className="flex items-center justify-between gap-3 border-t pt-4 lg:min-w-[320px] lg:justify-end lg:border-t-0 lg:pt-0">
                  <div>
                    <p className="text-xs text-muted-foreground">مبلغ سفارش</p>

                    <p className="mt-1 text-base font-bold sm:text-lg">
                      {formatPrice(order.total)}

                      <span className="mr-1 text-xs font-normal text-muted-foreground">تومان</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCancelable(order.status) && (
                      <ConfirmDialog
                        trigger={
                          <button
                            type="button"
                            disabled={isCanceling}
                            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                          >
                            لغو سفارش
                          </button>
                        }
                        title="لغو سفارش"
                        description="آیا مطمئن هستید می‌خواهید این سفارش را لغو کنید؟ این عملیات قابل بازگشت نیست."
                        confirmText="بله، لغو کن"
                        cancelText="انصراف"
                        onConfirm={() => handleCancel(order.id)}
                      />
                    )}

                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      جزئیات سفارش
                      <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

function OrdersHeader({ orderCount }: { orderCount?: number }) {
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList className="size-5" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">سفارش‌های من</h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            سفارش‌های ثبت‌شده، وضعیت و جزئیات آن‌ها را از این بخش مشاهده و پیگیری کنید.
          </p>
        </div>

        {orderCount !== undefined && (
          <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground">
            <ShoppingBag className="size-4" />

            <span>{orderCount.toLocaleString('fa-IR')}</span>

            <span>سفارش</span>
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border bg-card p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="hidden size-12 rounded-xl bg-muted sm:block" />

              <div className="space-y-3">
                <div className="h-5 w-48 rounded bg-muted" />
                <div className="h-4 w-64 rounded bg-muted" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-5 border-t pt-4 lg:border-t-0 lg:pt-0">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-muted" />
                <div className="h-5 w-28 rounded bg-muted" />
              </div>

              <div className="h-10 w-32 rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OrdersEmpty() {
  return (
    <section className="flex flex-col items-center justify-center rounded-2xl border bg-card px-6 py-16 text-center shadow-sm">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Package className="size-7" />
      </div>

      <h2 className="text-lg font-bold">هنوز سفارشی ثبت نکرده‌اید</h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        بعد از ثبت اولین سفارش، اطلاعات سفارش و وضعیت آن در این بخش نمایش داده می‌شود.
      </p>

      <Link
        href="/products"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        مشاهده محصولات
      </Link>
    </section>
  );
}

function OrdersError({ message }: { message: string }) {
  return (
    <section className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-12 text-center">
      <h2 className="font-semibold">دریافت سفارش‌ها با خطا مواجه شد</h2>

      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </section>
  );
}
