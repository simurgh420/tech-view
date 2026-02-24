'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { UserRole } from '@/types/user';
import { setUserRoleAction } from '@/services/action/user/setUserRoleAction';

interface UserRoleSelectProps {
  userId: string;
  role: UserRole;
}

export const UserRoleSelect = ({ userId, role }: UserRoleSelectProps) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleChange(evt: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = evt.target.value as UserRole;

    setIsPending(true);
    const res = await setUserRoleAction(userId, newRole);
    setIsPending(false);

    if (res.error) {
      toast.error(res.error ?? 'خطا در تغییر نقش');
    } else {
      toast.success('نقش با موفقیت بروزرسانی شد');
      router.refresh();
    }
  }

  return (
    <select
      value={role}
      onChange={handleChange}
      disabled={role === 'ADMIN' || isPending}
      className="px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="USER">USER</option>
      <option value="ADMIN">ADMIN</option>
    </select>
  );
};
