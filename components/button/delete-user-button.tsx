'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';

import { toast } from 'sonner';
import { deleteUserAction } from '@/services/action/user/deleteUserAction';

interface DeleteUserButtonProps {
  userId: string;
}

export const DeleteUserButton = ({ userId }: DeleteUserButtonProps) => {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    const res = await deleteUserAction(userId);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('کاربر با موفقیت حذف شد');
    }
    setIsPending(false);
  }

  return (
    <Button
      size="icon"
      variant="destructive"
      className="size-7 rounded-sm"
      onClick={handleClick}
      disabled={isPending}
    >
      <span className="sr-only">حذف کاربر</span>
      <TrashIcon />
    </Button>
  );
};

export const PlaceholderDeleteUserButton = () => {
  return (
    <Button size="icon" variant="destructive" className="size-7 rounded-sm" disabled>
      <span className="sr-only">حذف کاربر</span>
      <TrashIcon />
    </Button>
  );
};
