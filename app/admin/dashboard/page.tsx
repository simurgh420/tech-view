// admin/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Users, User, Tag, FolderTree, FileText, Package, Heart } from 'lucide-react';
import { AdminDashboardCard } from '@/components/admin/AdminDashboardCard';
import { Breadcrumb } from '@/components/layout/breadcrumb';

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
        <div className="mb-2">
          <Breadcrumb />
        </div>
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <span className="text-green-600">🛡️</span>
          <span>داشبورد مدیریت</span>
        </h1>

        <p className="text-lg leading-relaxed max-w-2xl">
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
          description="مدیریت پست‌ها و نظرات کاربران روی آن‌ها"
          icon={FileText}
          iconClassName="text-blue-600"
        />
        <AdminDashboardCard
          href="/admin/products"
          title="محصولات"
          description="مدیریت محصولات، ریویوها و دیدگاه‌های آن‌ها"
          icon={Package}
          iconClassName="text-emerald-600"
        />
        <AdminDashboardCard
          href="/admin/categories"
          title="دسته‌بندی‌ها"
          description="ساخت و مدیریت دسته‌بندی‌های محصولات"
          icon={FolderTree}
          iconClassName="text-cyan-600"
        />
        <AdminDashboardCard
          href="/admin/brands"
          title="برندها"
          description="ساخت و مدیریت برندهای محصولات"
          icon={Tag}
          iconClassName="text-violet-600"
        />
        <AdminDashboardCard
          href="/admin/wishlist"
          title="علاقه‌مندی‌ها"
          description="مدیریت آیتم‌های ذخیره‌شده کاربران"
          icon={Heart}
          iconClassName="text-pink-600"
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
