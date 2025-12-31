import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UsersTable } from '@/components/sections/users/users-table';
import { Button } from '@/components/ui';

export default async function UsersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدیریت کاربران</h1>
          <p className="text-gray-500 text-sm mt-1">مشاهده، ویرایش و مدیریت نقش کاربران</p>{' '}
        </div>
        <div className="flex items-center gap-3">
          <Button className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700">
            افزودن کاربر
          </Button>
        </div>
      </div>
      <UsersTable />
    </div>
  );
}
