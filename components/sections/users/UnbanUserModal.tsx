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

export function UnbanUserModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);

  async function handleUnban() {
    await unbanUserAction(userId);
    setOpen(false);
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        رفع بن
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
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
