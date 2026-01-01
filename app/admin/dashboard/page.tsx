// admin/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold flex items-center gap-3">
        <span>Admin Dashboard</span>
        <Link href="/admin/dashboard/users" className="text-sm text-blue-600 hover:underline">
          کاربران
        </Link>
      </h1>
    </div>
  );
}
