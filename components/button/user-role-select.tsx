'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { UserRole } from '@/types/user';
import { setUserRoleAction } from '@/services/action/user/setUserRoleAction';
import { useNotify } from '@/hooks/useNotify';

interface UserRoleSelectProps {
  userId: string;
  role: UserRole;
  disabled?: boolean;
}

export const UserRoleSelect = ({ userId, role, disabled = false }: UserRoleSelectProps) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const notify = useNotify();

  // اگر نقش SUPER_ADMIN باشد، فقط متن نمایش بده (قابل تغییر نیست)
  if (role === 'SUPER_ADMIN') {
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        SUPER ADMIN
      </span>
    );
  }

  async function handleChange(evt: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = evt.target.value as UserRole;
    if (newRole === role) return;

    setIsPending(true);
    try {
      const res = await setUserRoleAction(userId, newRole);
      if (res.error) {
        notify.error(res.error);
        return;
      }
      notify.success('نقش با موفقیت بروزرسانی شد');
      router.refresh();
    } catch {
      notify.error('خطا در تغییر نقش');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <select
      value={role}
      onChange={handleChange}
      disabled={disabled || isPending}
      className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="USER">USER</option>
      <option value="ADMIN">ADMIN</option>
    </select>
  );
};
