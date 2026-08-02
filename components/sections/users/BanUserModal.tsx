'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { banUserAction } from '@/services/action/user/banUserAction';
import { useRouter } from 'next/navigation';
import { useNotify } from '@/hooks/useNotify';

export function BanUserModal({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<{ reason: string; duration: string }>({
    defaultValues: { duration: '7' },
  });
  const notify = useNotify();

  async function onSubmit(values: { reason: string; duration: string }) {
    const expiresIn = values.duration === 'forever' ? 0 : Number(values.duration) * 60 * 60 * 24;

    const res = await banUserAction(userId, values.reason, expiresIn);

    if (res.success) {
      router.refresh();
      setOpen(false);
      notify.success('کاربر با موفقیت بن شد');
    } else {
      notify.error(res.error || '');
    }
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        بن
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>بن کردن کاربر</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input {...register('reason')} placeholder="دلیل بن" />

            <Controller
              control={control}
              name="duration"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="مدت زمان بن" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">۷ روز</SelectItem>
                    <SelectItem value="30">۳۰ روز</SelectItem>
                    <SelectItem value="forever">همیشگی</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                انصراف
              </Button>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? 'در حال ثبت...' : 'تایید'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
