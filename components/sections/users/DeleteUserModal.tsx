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
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function DeleteUserModal({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { handleSubmit } = useForm();

  async function onSubmit() {
    const res = await deleteUserAction(userId);
    if (res.success) {
      router.refresh();
      toast.success('کاربر حذف شد');
      setOpen(false);
    } else {
      toast.error(res.error);
    }
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
