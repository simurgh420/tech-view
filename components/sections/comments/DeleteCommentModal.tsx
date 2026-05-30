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
import { useNotify } from '@/hooks/useNotify';
import { useAdminComments } from '@/hooks/useAdmin/useAdminComments';

export function DeleteCommentModal({ commentId }: { commentId: string }) {
  const [open, setOpen] = useState(false);
  const { deleteComment } = useAdminComments();
  const notify = useNotify();

  async function handleDelete() {
    deleteComment.mutate(commentId, {
      onSuccess: () => {
        notify.success('کامنت با موفقیت حذف شد ✅');
        setOpen(false);
      },
      onError: (err: any) => {
        const message = err?.response?.data?.error || 'خطا در حذف کامنت ❌';
        notify.error(message);
      },
    });
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        حذف
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف کامنت</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            آیا مطمئن هستید که می‌خواهید این کامنت را حذف کنید؟
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteComment.isPending}>
              {deleteComment.isPending ? 'در حال حذف...' : 'تایید'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
