// components/sections/product-comments/DeleteProductCommentModal.tsx
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
import { useProductComments } from '@/hooks/useProductComments';

export function DeleteProductCommentModal({
  commentId,
  productSlug,
}: {
  commentId: string;
  productSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const { useDeleteComment } = useProductComments(productSlug);
  const deleteComment = useDeleteComment();
  const notify = useNotify();

  function handleDelete() {
    deleteComment.mutate(commentId, {
      onSuccess: () => {
        notify.success('دیدگاه با موفقیت حذف شد ✅');
        setOpen(false);
      },
      onError: (err: any) => {
        const message = err?.response?.data?.error || 'خطا در حذف دیدگاه ❌';
        notify.error(message);
      },
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        حذف
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>حذف دیدگاه</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            آیا مطمئن هستید؟ اگر این دیدگاه پاسخ داشته باشد، متن آن با «این دیدگاه حذف شده است»
            جایگزین می‌شود.
          </p>
          <DialogFooter className="flex-row justify-start gap-2">
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
