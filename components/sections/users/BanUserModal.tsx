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
import { Input } from '@/components/ui/input';
import { banUserAction } from '@/services/action/user/banUserAction';

export function BanUserModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit } = useForm<{ reason: string; duration: string }>();

  async function onSubmit(values: { reason: string; duration: string }) {
    const expiresIn = values.duration === 'forever' ? 0 : Number(values.duration) * 60 * 60 * 24;
    await banUserAction(userId, values.reason, expiresIn);
    setOpen(false);
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        بن
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>بن کردن کاربر</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input {...register('reason')} placeholder="دلیل بن" />
            <select {...register('duration')} className="w-full border rounded-md p-2">
              <option value="7">۷ روز</option>
              <option value="30">۳۰ روز</option>
              <option value="forever">همیشگی</option>
            </select>
            <DialogFooter>
              <Button type="submit">تایید</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
