// app/admin/reports/page.tsx

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from 'lucide-react';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';

import { getDashboardStats } from '@/services/reports/db/queries';
import { formatPrice } from '@/lib/formatPrice';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'در انتظار پرداخت',
  PAID: 'پرداخت‌شده',
  SHIPPED: 'ارسال‌شده',
  DELIVERED: 'تحویل‌شده',
  CANCELED: 'لغوشده',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:
    'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',

  PAID:
    'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',

  SHIPPED:
    'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',

  DELIVERED:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',

  CANCELED:
    'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
};

function StatCard({
  icon: Icon,
  label,
  value,
  iconClassName,
  iconBgClassName,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  iconClassName: string;
  iconBgClassName: string;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`rounded-xl p-3 ${iconBgClassName}`}>
          <Icon
            className={`size-6 ${iconClassName}`}
            aria-hidden="true"
          />
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="text-2xl font-bold">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatGrowth(value: number) {
  const sign = value > 0 ? '+' : '';

  return `${sign}${value.toFixed(1)}%`;
}

function getGrowthClass(value: number) {
  if (value > 0) {
    return 'text-emerald-600 dark:text-emerald-400';
  }

  if (value < 0) {
    return 'text-red-600 dark:text-red-400';
  }

  return 'text-muted-foreground';
}

export default async function AdminReportsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/unauthorized');
  }

  if (
    session.user.role !== 'ADMIN' &&
    session.user.role !== 'SUPER_ADMIN'
  ) {
    redirect('/forbidden');
  }

  const dashboard = await getDashboardStats();

  const {
    revenue,
    revenueGrowth,
    orders,
    ordersGrowth,
    users,
    usersGrowth,
    products,
  } = dashboard.stats;

  return (
    <div
      dir="rtl"
      className="container mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12"
    >
      {/* Header */}
      <div className="space-y-5">
        <Breadcrumb />

        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            گزارش‌ها
          </h1>

          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            نمای کلی عملکرد فروشگاه در ۳۰ روز اخیر.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <section
        aria-label="آمار گزارش‌ها"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          icon={DollarSign}
          label="فروش ۳۰ روز اخیر"
          value={`${formatPrice(revenue)} تومان`}
          iconClassName="text-emerald-600 dark:text-emerald-400"
          iconBgClassName="bg-emerald-50 dark:bg-emerald-950/40"
        />

        <StatCard
          icon={ShoppingCart}
          label="سفارش‌های ۳۰ روز اخیر"
          value={formatPrice(orders)}
          iconClassName="text-blue-600 dark:text-blue-400"
          iconBgClassName="bg-blue-50 dark:bg-blue-950/40"
        />

        <StatCard
          icon={Users}
          label="کاربران جدید"
          value={formatPrice(users)}
          iconClassName="text-indigo-600 dark:text-indigo-400"
          iconBgClassName="bg-indigo-50 dark:bg-indigo-950/40"
        />

        <StatCard
          icon={Package}
          label="محصولات منتشرشده"
          value={formatPrice(products)}
          iconClassName="text-violet-600 dark:text-violet-400"
          iconBgClassName="bg-violet-50 dark:bg-violet-950/40"
        />
      </section>

      {/* Growth */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">
                رشد فروش
              </p>

              <p
                className={`mt-2 text-2xl font-bold ${getGrowthClass(
                  revenueGrowth,
                )}`}
              >
                {formatGrowth(revenueGrowth)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                نسبت به ۳۰ روز قبل
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                رشد سفارش‌ها
              </p>

              <p
                className={`mt-2 text-2xl font-bold ${getGrowthClass(
                  ordersGrowth,
                )}`}
              >
                {formatGrowth(ordersGrowth)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                نسبت به ۳۰ روز قبل
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                رشد کاربران
              </p>

              <p
                className={`mt-2 text-2xl font-bold ${getGrowthClass(
                  usersGrowth,
                )}`}
              >
                {formatGrowth(usersGrowth)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                نسبت به ۳۰ روز قبل
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              آخرین سفارش‌ها
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              آخرین سفارش‌های ثبت‌شده در سیستم
            </p>
          </div>

          {dashboard.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              هنوز سفارشی ثبت نشده است.
            </p>
          ) : (
            <div className="space-y-2">
              {dashboard.recentOrders.map((order) => {
                const statusClass =
                  STATUS_COLORS[order.status] ?? 'bg-muted text-muted-foreground';

                const statusLabel =
                  STATUS_LABELS[order.status] ?? order.status;

                return (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 rounded-lg border border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="truncate font-medium">
                        {order.userName}
                      </span>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="text-xs text-muted-foreground">
                        #{order.id}
                      </span>

                      <span className="font-semibold">
                        {formatPrice(order.total)} تومان
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}