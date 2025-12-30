// admin/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

import { headers } from 'next/headers';

export default async function AdminDashboard() {
  const headerList = headers();

  const session = await auth.api.getSession({
    headers: Object.fromEntries((await headerList).entries()),
  });

  if (!session) redirect('/login');

  return (
    <div>
      <h1>Admin Dashboard</h1>
    </div>
  );
}
