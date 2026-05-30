'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';

import { deleteUserAction } from '@/services/action/user/deleteUserAction';
import { useNotify } from '@/hooks/useNotify';

interface DeleteUserButtonProps {
  userId: string;
}

export const DeleteUserButton = ({ userId }: DeleteUserButtonProps) => {
  const [isPending, setIsPending] = useState(false);
  const notify = useNotify();

  async function handleClick() {
    setIsPending(true);
    const res = await deleteUserAction(userId);

    if (res.error) {
      notify.error(res.error);
    } else {
      notify.success('کاربر با موفقیت حذف شد');
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
