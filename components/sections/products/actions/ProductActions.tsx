'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDeleteProduct } from '@/hooks/useProducts';

type Props = {
  slug: string;
};

export function ProductActions({ slug }: Props) {
  const router = useRouter();

  const { mutate: deleteProduct } = useDeleteProduct();

  return (
    <div className="flex gap-3">
      {/* ویرایش */}
      <Link
        href={`/products/edit/${slug}`}
        className="
          rounded-md
          px-3
          py-2
          transition
          hover:bg-neutral-100
          dark:hover:bg-neutral-800
        "
      >
        ✏️ ویرایش محصول
      </Link>

      {/* حذف */}
      <ConfirmDialog
        trigger={<Button variant="destructive">🗑 حذف محصول</Button>}
        title="حذف محصول"
        description="
        آیا مطمئن هستید که می‌خواهید این محصول را حذف کنید؟
        این عملیات قابل بازگشت نیست.
        "
        confirmText="بله، حذف کن"
        cancelText="لغو"
        onConfirm={() =>
          deleteProduct(slug, {
            onSuccess: () => {
              router.push('/products');
            },
          })
        }
      />
    </div>
  );
}
