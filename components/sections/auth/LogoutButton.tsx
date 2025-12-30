'use client';

import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/auth/useLogout';
import { useRouter } from 'next/navigation';
import { useNotify } from '@/hooks/useNotify';

export function LogoutButton() {
  const logoutMutation = useLogout();
  const router = useRouter();
  const notify = useNotify();

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
      notify.success('با موفقیت خارج شدید');
      router.push('/');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      notify.error('خطا در خروج', err?.message);
    }
  }

  return (
    <Button variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending}>
      {logoutMutation.isPending ? 'در حال خروج...' : 'خروج'}
    </Button>
  );
}
