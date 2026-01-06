'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
} from '@/components/ui/dialog';
import { unbanUserAction } from '@/services/action/user/unbanUserAction';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function UnbanUserModal({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleUnban() {
    const res = await unbanUserAction(userId);
    if (res.success) {
      router.refresh();
      setOpen(false);
      toast.success('کاربر از بن خارج شد');
    } else {
      toast.error(res.error);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        رفع بن
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" />

        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفع بن کاربر</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button onClick={handleUnban}>تایید</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
