'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { deleteUserAction } from '@/services/action/user/deleteUserAction';
import { useRouter } from 'next/navigation';
import { useNotify } from '@/hooks/useNotify';

export function DeleteUserModal({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = useNotify();

  async function handleDelete() {
    setIsSubmitting(true);
    const res = await deleteUserAction(userId);
    setIsSubmitting(false);

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
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>حذف کاربر</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟ این عملیات قابل بازگشت نیست.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              انصراف
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? 'در حال حذف...' : 'تایید'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
