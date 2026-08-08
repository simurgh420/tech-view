import { ShieldAlert, Users } from 'lucide-react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { UsersTable } from '@/components/sections/users/users-table';
import { auth } from '@/lib/auth';

export default async function UsersPage() {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    redirect('/unauthorized');
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="rounded-full bg-destructive/10 p-3 text-destructive">
            <ShieldAlert className="size-8" />
          </span>

          <h1 className="text-2xl font-bold">دسترسی غیرمجاز</h1>

          <p className="text-sm leading-7 text-muted-foreground">
            شما اجازه دسترسی به این بخش را ندارید.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { users } = await auth.api.listUsers({
    headers: headersList,
    query: {
      sortBy: 'name',
    },
  });

  const sortedUsers = [...users].sort((a, b) => {
    if (a.role === 'SUPER_ADMIN' && b.role !== 'SUPER_ADMIN') {
      return -1;
    }

    if (a.role !== 'SUPER_ADMIN' && b.role === 'SUPER_ADMIN') {
      return 1;
    }

    if (a.role === 'ADMIN' && b.role !== 'ADMIN') {
      return -1;
    }

    if (a.role !== 'ADMIN' && b.role === 'ADMIN') {
      return 1;
    }

    return 0;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3 p-2">
        <h1 className="text-4xl font-bold tracking-tight text-right">مدیریت کاربران</h1>

        <p className="text-lg leading-relaxed text-muted-foreground text-right">
          در این بخش می‌توانید کاربران را مدیریت کنید، نقش‌ها را تغییر دهید و دسترسی‌ها را کنترل
          کنید
        </p>

        <div className="border-b pt-4" />
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-end gap-3">
            <h2 className="text-lg font-semibold">لیست کاربران</h2>
            <span className="rounded-xl bg-primary/10 p-2 text-primary">
              <Users className="size-5" />
            </span>
          </div>

          <UsersTable
            users={sortedUsers}
            currentUserId={session.user.id}
            currentUserRole={session.user.role}
          />
        </CardContent>
      </Card>
    </div>
  );
}
