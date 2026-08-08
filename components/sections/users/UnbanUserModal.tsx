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

import { unbanUserAction } from '@/services/action/user/unbanUserAction';
import { useNotify } from '@/hooks/useNotify';

export function UnbanUserModal({ userId }: { userId: string }) {
  const router = useRouter();
  const notify = useNotify();

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleUnban() {
    setIsSubmitting(true);

    try {
      const res = await unbanUserAction(userId);

      if (res.success) {
        router.refresh();
        setOpen(false);

        notify.success('کاربر از بن خارج شد');
      } else {
        notify.error(res.error || 'خطا در رفع بن کاربر');
      }
    } catch {
      notify.error('خطایی هنگام رفع بن کاربر رخ داد');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        رفع بن
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>رفع بن کاربر</DialogTitle>
          </DialogHeader>

          <p className="text-sm leading-7 text-muted-foreground">
            آیا مطمئن هستید که می‌خواهید این کاربر را از حالت بن خارج کنید؟
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              انصراف
            </Button>

            <Button onClick={handleUnban} disabled={isSubmitting}>
              {isSubmitting ? 'در حال ثبت...' : 'تایید'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
