'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import type { User } from '@/types/user';
import { useUsers } from '@/hooks/useUsers';
import { toast } from 'sonner';

export function UserRowActions({ user }: { user: User }) {
  const { useDeleteUser, useUpdateUser } = useUsers();
  const deleteMutation = useDeleteUser();
  const updateMutation = useUpdateUser();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`آیا از حذف کاربر ${user.email} مطمئنی؟`)) return;
    setLoading(true);
    try {
      await deleteMutation.mutateAsync(user.id);
      toast.success('کاربر با موفقیت حذف شد.');
    } catch {
      toast.error('حذف با خطا مواجه شد.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRole() {
    setLoading(true);
    try {
      const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
      await updateMutation.mutateAsync({ id: user.id, data: { role: newRole } });
      toast.success('نقش کاربر با موفقیت تغییر کرد.');
    } catch {
      toast.error('تغییر نقش با خطا مواجه شد.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit() {
    const newName = prompt('نام جدید کاربر را وارد کنید:', user.name ?? '');
    if (!newName) return;
    setLoading(true);
    try {
      await updateMutation.mutateAsync({ id: user.id, data: { name: newName } });
      toast.success('نام کاربر با موفقیت تغییر کرد.');
    } catch {
      toast.error('ویرایش با خطا مواجه شد.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="z-50">
        <DropdownMenuLabel>عملیات</DropdownMenuLabel>

        <DropdownMenuItem onClick={handleEdit} disabled={loading}>
          ویرایش
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleToggleRole} disabled={loading}>
          {user.role === 'ADMIN' ? 'تنزل به کاربر' : 'ارتقا به مدیر'}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            if (user.role === 'ADMIN') {
              toast.error('ادمین قابل حذف نیست.');
              return;
            }
            handleDelete();
          }}
          className="text-red-600"
          disabled={loading || user.role === 'ADMIN'}
        >
          حذف
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
