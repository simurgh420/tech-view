'use client';

import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

type ConfirmDialogProps = {
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmDialog({
  trigger,
  title = 'آیا مطمئن هستید؟',
  description = 'این عملیات قابل بازگشت نیست.',
  confirmText = 'تأیید',
  cancelText = 'لغو',
  onConfirm,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent dir="rtl" className="text-right">
        <AlertDialogHeader className="text-right">
          <AlertDialogTitle className="text-right">{title}</AlertDialogTitle>

          <AlertDialogDescription className="text-right">{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter dir="rtl">
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>

          <AlertDialogAction onClick={handleConfirm} disabled={loading}>
            {loading ? 'در حال حذف…' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
