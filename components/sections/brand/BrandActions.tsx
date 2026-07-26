'use client';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDeleteBrand } from '@/hooks/useBrands';
import { useRouter } from 'next/navigation';

export function BrandActions({ slug }: { slug: string }) {
  const router = useRouter();
  const { mutate: deleteBrand } = useDeleteBrand();

  return (
    <ConfirmDialog
      trigger={
        <Button variant="destructive" size="sm">
          🗑 حذف برند
        </Button>
      }
      title="حذف برند"
      description="آیا مطمئن هستید که می‌خواهید این برند را حذف کنید؟ این عملیات قابل بازگشت نیست."
      confirmText="بله، حذف کن"
      cancelText="لغو"
      onConfirm={() =>
        deleteBrand(slug, {
          onSuccess: () => router.push('/brands'),
        })
      }
    />
  );
}
