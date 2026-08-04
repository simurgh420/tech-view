// PostActions.tsx
'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDeleteBlog } from '@/hooks/useBlogs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Props = {
  slug: string;
};

export function PostActions({ slug }: Props) {
  const router = useRouter();
  const { mutate: deleteBlog } = useDeleteBlog();

  return (
    <div className="flex gap-3">
      <Link
        href={`/blog/edit/${slug}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:text-white"
      >
        <Pencil size={14} />
        ویرایش بلاگ
      </Link>

      <ConfirmDialog
        trigger={
          <Button variant="destructive" className="inline-flex items-center gap-1.5">
            <Trash2 size={14} />
            حذف بلاگ
          </Button>
        }
        title="حذف بلاگ"
        description="آیا مطمئن هستید که می‌خواهید این بلاگ را حذف کنید؟ این عملیات قابل بازگشت نیست."
        confirmText="بله، حذف کن"
        cancelText="لغو"
        onConfirm={() => deleteBlog(slug, { onSuccess: () => router.push('/blog') })}
      />
    </div>
  );
}
