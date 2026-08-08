import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/unauthorized');
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/unauthorized');
  }
  return <>{children}</>;
}
