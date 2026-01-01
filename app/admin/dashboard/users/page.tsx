import { ReturnButton } from '@/components/sections/button/return-button';
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
      <div className="px-8 py-16 container mx-auto max-w-5xl space-y-8">
        <div className="space-y-4">
          <ReturnButton href="/profile" label="Profile" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="p-2 rounded-md text-lg bg-red-600 text-white font-bold">FORBIDDEN</p>
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
    <div className="px-8 py-16 container mx-auto max-w-5xl space-y-8">
      <div className="space-y-4">
        <ReturnButton href="/profile" label="Profile" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="p-2 rounded-md text-lg bg-green-600 text-white font-bold">ACCESS GRANTED</p>
      </div>

      <UsersTable users={sortedUsers} />
    </div>
  );
}
