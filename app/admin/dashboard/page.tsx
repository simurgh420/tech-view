// admin/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Users, User, FileText, MessageSquare, Package, Star } from 'lucide-react';
import { AdminDashboardCard } from '@/components/admin/AdminDashboardCard';

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect('/unauthorized');
  }

  return (
    <div className="container mx-auto max-w-6xl px-8 py-16 space-y-12" dir="rtl">
      {/* Header */}
      <div className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight  flex items-center gap-3">
          <span className="text-green-600">🛡️</span>
          <span>داشبورد مدیریت</span>
        </h1>

        <p className=" text-lg leading-relaxed max-w-2xl">
          به بخش مدیریت خوش آمدید. در اینجا می‌توانید کاربران را مدیریت کنید و پروفایل خود را ویرایش
          کنید.
        </p>

        <div className="border-b pt-4" />
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminDashboardCard
          href="/admin/dashboard/users"
          title="مدیریت کاربران"
          description="مشاهده، ویرایش و حذف کاربرهای سیستم"
          icon={Users}
        />
        <AdminDashboardCard
          href="/admin/blogs"
          title="بلاگ"
          description="مدیریت پست‌ها و محتوای بلاگ"
          icon={FileText}
          iconClassName="text-blue-600"
        />
        <AdminDashboardCard
          href="/admin/comments"
          title="کامنت‌ها"
          description="مشاهده و مدیریت نظرات کاربران"
          icon={MessageSquare}
          iconClassName="text-orange-600"
        />
        <AdminDashboardCard
          href="/admin/products"
          title="محصولات"
          description="مدیریت محصولات و اطلاعات آن‌ها"
          icon={Package}
          iconClassName="text-emerald-600"
        />
        <AdminDashboardCard
          href="/admin/reviews"
          title="نظرات محصولات"
          description="بازبینی نظرات ثبت‌شده روی محصولات"
          icon={Star}
          iconClassName="text-amber-600"
        />
        <AdminDashboardCard
          href="/profile"
          title="پروفایل"
          description="ویرایش اطلاعات شخصی و تغییر رمز عبور"
          icon={User}
          iconClassName="text-purple-600"
        />
      </div>
    </div>
  );
}
