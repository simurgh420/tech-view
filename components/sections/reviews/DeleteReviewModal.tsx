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
import { useDeleteReview } from '@/hooks/useReviews';

interface DeleteReviewModalProps {
  reviewId: string;
  productSlug: string;
}

export function DeleteReviewModal({ reviewId, productSlug }: DeleteReviewModalProps) {
  const [open, setOpen] = useState(false);

  const deleteReview = useDeleteReview(productSlug);

  const notify = useNotify();

  function handleDelete() {
    deleteReview.mutate(reviewId, {
      onSuccess: () => {
        notify.success('نظر با موفقیت حذف شد ✅');

        setOpen(false);
      },

      onError: error => {
        notify.error(error instanceof Error ? error.message : 'خطا در حذف نظر ❌');
      },
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="
          h-auto
          p-0

          text-xs
          text-muted-foreground

          hover:text-destructive
        "
        onClick={() => setOpen(true)}
      >
        حذف
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>حذف نظر</DialogTitle>
          </DialogHeader>

          <p
            className="
              text-sm
              leading-7
              text-muted-foreground
            "
          >
            آیا مطمئن هستید که می‌خواهید این نظر را حذف کنید؟
          </p>

          <DialogFooter
            className="
              flex-row-reverse
              gap-2
            "
          >
            <Button variant="destructive" onClick={handleDelete} disabled={deleteReview.isPending}>
              {deleteReview.isPending ? 'در حال حذف...' : 'تایید'}
            </Button>

            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={deleteReview.isPending}
            >
              انصراف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
