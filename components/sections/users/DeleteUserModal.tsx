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
  DialogOverlay,
} from '@/components/ui/dialog';
import { deleteUserAction } from '@/services/action/user/deleteUserAction';
import { useRouter } from 'next/navigation';
import { useNotify } from '@/hooks/useNotify';

export function DeleteUserModal({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { handleSubmit } = useForm();
  const notify = useNotify();

  async function onSubmit() {
    const res = await deleteUserAction(userId);
    if (res.success) {
      router.refresh();
      notify.success('کاربر حذف شد');
      setOpen(false);
    } else {
      notify.error(res.error || '');
    }
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        حذف
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" />

        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف کاربر</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button variant="destructive" onClick={handleSubmit(onSubmit)}>
              تایید
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
