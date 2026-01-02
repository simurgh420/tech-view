// admin/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Users, User } from 'lucide-react';

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
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <span className="text-green-600">🛡️</span>
          <span>داشبورد مدیریت</span>
        </h1>

        <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
          به بخش مدیریت خوش آمدید. در اینجا می‌توانید کاربران را مدیریت کنید و پروفایل خود را ویرایش
          کنید.
        </p>

        <div className="border-b border-gray-200 pt-4" />
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users Card */}
        <Link
          href="/admin/dashboard/users"
          className="group bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex items-center gap-4 hover:shadow-lg hover:border-gray-300 transition-all"
        >
          <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
            <Users className="size-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900">
              مدیریت کاربران
            </h2>
            <p className="text-sm text-gray-500">مشاهده، ویرایش و حذف کاربران سیستم</p>
          </div>
        </Link>

        {/* Profile Card */}
        <Link
          href="/profile"
          className="group bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex items-center gap-4 hover:shadow-lg hover:border-gray-300 transition-all"
        >
          <div className="p-3 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors">
            <User className="size-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900">
              پروفایل
            </h2>
            <p className="text-sm text-gray-500">ویرایش اطلاعات شخصی و تغییر رمز عبور</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
