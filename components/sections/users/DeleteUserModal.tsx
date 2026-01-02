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
import { deleteUserAction } from '@/services/action/user/delete-user.action';

export function DeleteUserModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const { handleSubmit } = useForm();

  async function onSubmit() {
    await deleteUserAction(userId);
    setOpen(false);
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        حذف
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
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
