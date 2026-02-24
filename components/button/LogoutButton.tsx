'use client';

import { logoutAction } from '@/services/action/user/logout';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await logoutAction();
        router.refresh(); //
      }}
      className={className}
    >
      خروج از حساب
    </button>
  );
}
