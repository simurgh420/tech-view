'use client';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDeleteCategory } from '@/hooks/useCategories';
import { useRouter } from 'next/navigation';

export function CategoryActions({ slug }: { slug: string }) {
  const router = useRouter();
  const { mutate: deleteCategory } = useDeleteCategory();

  return (
    <ConfirmDialog
      trigger={
        <Button variant="destructive" size="sm">
          🗑 حذف کتگوری
        </Button>
      }
      title="حذف کتگوری"
      description="آیا مطمئن هستید که می‌خواهید این کتگوری را حذف کنید؟ این عملیات قابل بازگشت نیست."
      confirmText="بله، حذف کن"
      cancelText="لغو"
      onConfirm={() =>
        deleteCategory(slug, {
          onSuccess: () => router.push('/categories'),
        })
      }
    />
  );
}
