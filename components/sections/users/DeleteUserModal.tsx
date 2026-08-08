'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { deleteUserAction } from '@/services/action/user/deleteUserAction';
import { useNotify } from '@/hooks/useNotify';

export function DeleteUserModal({ userId }: { userId: string }) {
  const router = useRouter();
  const notify = useNotify();

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDelete() {
    setIsSubmitting(true);

    try {
      const res = await deleteUserAction(userId);

      if (res.success) {
        router.refresh();
        setOpen(false);

        notify.success('کاربر حذف شد');
      } else {
        notify.error(res.error || 'خطا در حذف کاربر');
      }
    } catch {
      notify.error('خطایی هنگام حذف کاربر رخ داد');
    } finally {
      setIsSubmitting(false);
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

          <p className="text-sm leading-7 text-muted-foreground">
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
