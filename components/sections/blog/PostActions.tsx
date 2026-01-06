// PostActions.tsx
'use client';

import { Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useBlogs } from '@/hooks/useBlogs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Props = {
  slug: string;
};
export function PostActions({ slug }: Props) {
  const router = useRouter();
  const { useDeleteBlog } = useBlogs();
  const { mutate: deleteBlog } = useDeleteBlog();

  return (
    <div className="flex gap-3">
      {/* دکمه ویرایش */}
      <Link
        href={`/blog/edit/${slug}`}
        className="inline-block px-3 py-1 rounded hover:bg-gray-600 transition"
      >
        ✏️ ویرایش بلاگ
      </Link>
      {/* دکمه حذف */}
      <ConfirmDialog
        trigger={
          <Button variant="destructive" className="hover:text-red-500">
            🗑 حذف بلاگ
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
