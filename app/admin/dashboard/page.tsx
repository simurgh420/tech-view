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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users Card */}
        <Link
          href="/admin/dashboard/users"
          className="rounded-2xl shadow-md border p-6 flex items-center gap-4 hover:shadow-lg transition-all"
        >
          <div className="p-3 rounded-xl transition-colors">
            <Users className="size-6 " aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold  ">مدیریت کاربران</h2>
            <p className="text-sm ">مشاهده، ویرایش و حذف کار بران سیستم</p>
          </div>
        </Link>

        {/* Profile Card */}
        <Link
          href="/profile"
          className="rounded-2xl shadow-md border p-6 flex items-center gap-4 hover:shadow-lg  transition-all"
        >
          <div className="p-3 rounded-xl transition-colors">
            <User className="size-6 text-purple-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold ">پروفایل</h2>
            <p className="text-sm ">ویرایش اطلاعات شخصی و تغییر رمز عبور</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
