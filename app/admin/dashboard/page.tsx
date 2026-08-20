import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

import { Breadcrumb } from '@/components/layout/breadcrumb';

import { getDashboardOverview } from '@/services/reports/db/dashboard';
import {
  DashboardStats,
  QuickActions,
  RecentOrders,
  RevenueChart,
} from '@/components/admin/dashboard';

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/unauthorized');
  }

  // این قسمت را بعداً می‌توانیم به requireAdmin منتقل کنیم.
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    redirect('/forbidden');
  }

  const dashboard = await getDashboardOverview();

  return (
    <div
      dir="rtl"
      className="container mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12"
    >
      {/* Header */}
      <div className="space-y-5">
        <Breadcrumb />

        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/10 p-3">
            <ShieldCheck
              className="size-8 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">داشبورد مدیریت</h1>

            <p className="mt-1 text-muted-foreground">خلاصه وضعیت فروشگاه و عملکرد سیستم</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats stats={dashboard.stats} />

      {/* Main analytics */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(360px,1fr)]">
        <RevenueChart data={dashboard.revenueByDay} />

        <RecentOrders orders={dashboard.recentOrders} />
      </div>

      {/* Quick actions */}
      <QuickActions />
    </div>
  );
}
