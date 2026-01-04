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
        await logoutAction(); // کوکی و session پاک می‌شود
        router.refresh(); // ✅ UI فورس رفرش می‌شود
      }}
      className={className}
    >
      خروج از حساب
    </button>
  );
}
