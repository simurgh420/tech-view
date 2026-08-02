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
import { unbanUserAction } from '@/services/action/user/unbanUserAction';
import { useRouter } from 'next/navigation';
import { useNotify } from '@/hooks/useNotify';

export function UnbanUserModal({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = useNotify();

  async function handleUnban() {
    setIsSubmitting(true);
    const res = await unbanUserAction(userId);
    setIsSubmitting(false);

    if (res.success) {
      router.refresh();
      setOpen(false);
      notify.success('کاربر از بن خارج شد');
    } else {
      notify.error(res.error || '');
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
          <p className="text-sm text-muted-foreground">
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
