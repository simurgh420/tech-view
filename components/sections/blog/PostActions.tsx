// PostActions.tsx
'use client';

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
    <div className="mb-6 flex gap-3">
      {/* دکمه ویرایش */}
      <Link
        href={`/blog/edit/${slug}`}
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        ✏️ ویرایش بلاگ
      </Link>

      {/* دکمه حذف */}
      <ConfirmDialog
        trigger={
          <button className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
            🗑 حذف بلاگ
          </button>
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
