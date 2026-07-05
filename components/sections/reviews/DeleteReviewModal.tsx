// components/sections/reviews/DeleteReviewModal.tsx
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
import { useReviews } from '@/hooks/useReviews';

export function DeleteReviewModal({
  reviewId,
  productSlug,
}: {
  reviewId: string;
  productSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const { useDeleteReview } = useReviews(productSlug);
  const deleteReview = useDeleteReview();
  const notify = useNotify();

  function handleDelete() {
    deleteReview.mutate(reviewId, {
      onSuccess: () => {
        notify.success('نظر با موفقیت حذف شد ✅');
        setOpen(false);
      },
      onError: (err: any) => {
        const message = err?.response?.data?.error || 'خطا در حذف نظر ❌';
        notify.error(message);
      },
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        حذف
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>حذف نظر</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            آیا مطمئن هستید که می‌خواهید این نظر را حذف کنید؟
          </p>
          <DialogFooter className="flex-row justify-start gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteReview.isPending}>
              {deleteReview.isPending ? 'در حال حذف...' : 'تایید'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
