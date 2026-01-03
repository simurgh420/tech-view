'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { UserWithRole } from 'better-auth/plugins';
import { updateAdminUserAction } from '@/services/action/user/updateAdminUserAction';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function UpdateUserModal({ user }: { user: UserWithRole }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit } = useForm<{ name: string; email: string }>({
    defaultValues: { name: user.name, email: user.email },
  });

  async function onSubmit(values: { name: string; email: string }) {
    const res = await updateAdminUserAction(user.id, values);
    if (res.success) {
      router.refresh();
      setOpen(false);
      toast.success('اطلاعات کاربر با موفقیت بروزرسانی شد');
    } else {
      toast.error(res.error);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        ویرایش
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش کاربر</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input {...register('name')} placeholder="نام" />
            <Input {...register('email')} placeholder="ایمیل" />
            <DialogFooter>
              <Button type="submit">ذخیره تغییرات</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
