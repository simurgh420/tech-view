'use client';

import { admin } from '@/lib/auth-client';
import { UserRole } from '@/types/user';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface UserRoleSelectProps {
  userId: string;
  role: UserRole;
}

export const UserRoleSelect = ({ userId, role }: UserRoleSelectProps) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleChange(evt: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = evt.target.value as UserRole;

    const canChangeRole = await admin.hasPermission({
      permissions: {
        user: ['set-role'],
      },
    });

    if (!canChangeRole.data) {
      return toast.error('Forbidden');
    }

    await admin.setRole({
      userId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      role: newRole as any,
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: ctx => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success('User role updated');
          router.refresh();
        },
      },
    });
  }

  return (
    <select
      value={role}
      onChange={handleChange}
      disabled={role === 'ADMIN' || isPending}
      className="px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="ADMIN">ADMIN</option>
      <option value="USER">USER</option>
    </select>
  );
};
