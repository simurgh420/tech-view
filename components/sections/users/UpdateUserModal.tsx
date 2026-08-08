'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { updateAdminUserAction } from '@/services/action/user/updateAdminUserAction';
import { useNotify } from '@/hooks/useNotify';
import { UserWithRole } from 'better-auth/plugins';

type FormValues = {
  name: string;
  email: string;
};

export function UpdateUserModal({ user }: { user: UserWithRole }) {
  const router = useRouter();
  const notify = useNotify();

  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  async function onSubmit(values: FormValues) {
    const res = await updateAdminUserAction(user.id, values);

    if (res.success) {
      router.refresh();
      setOpen(false);

      notify.success('اطلاعات کاربر با موفقیت بروزرسانی شد');
    } else {
      notify.error(res.error || 'خطا در بروزرسانی اطلاعات کاربر');
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        ویرایش
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>ویرایش کاربر</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input {...register('name')} placeholder="نام" />

            <Input {...register('email')} placeholder="ایمیل" type="email" />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                انصراف
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
