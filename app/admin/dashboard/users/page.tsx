import { ReturnButton } from '@/components/button/return-button';
import { UsersTable } from '@/components/sections/users/users-table';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) redirect('/auth/login');

  if (session.user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto max-w-5xl px-8 py-16 space-y-10">
        <div className="space-y-6">
          <ReturnButton href="/profile" label="Profile" />

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight ">Admin Dashboard</h1>

            <p className="inline-block px-4 py-2 rounded-lg text-base font-semibold bg-red-600  shadow">
              FORBIDDEN
            </p>
          </div>

          <p className="text-gray-600 text-lg leading-relaxed">
            شما اجازه دسترسی به این بخش را ندارید.
          </p>
        </div>
      </div>
    );
  }

  const { users } = await auth.api.listUsers({
    headers: headersList,
    query: { sortBy: 'name' },
  });

  const sortedUsers = users.sort((a, b) => {
    if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
    if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
    return 0;
  });

  return (
    <div className="container mx-auto max-w-6xl px-8 py-16 space-y-12" dir="rtl">
      {/* Header */}
      <div className="space-y-6">
        <ReturnButton href="/profile" label="Profile" />

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
        </div>

        <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
          در این بخش می‌توانید کاربران را مدیریت کنید، نقش‌ها را تغییر دهید و دسترسی‌ها را کنترل
          کنید.
        </p>

        <div className="border-b  pt-4" />
      </div>

      {/* Users Table */}
      <div className=" rounded-2xl shadow-lg border  p-6">
        <h2 className="text-2xl font-semibold mb-6">لیست کاربران</h2>

        <UsersTable users={sortedUsers} />
      </div>
    </div>
  );
}
