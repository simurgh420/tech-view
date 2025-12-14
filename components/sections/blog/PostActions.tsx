// PostActions.tsx
'use client';

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
  const handleDelete = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این بلاگ را حذف کنید؟')) {
      deleteBlog(slug, {
        onSuccess: () => {
          // بعد از حذف، کاربر رو به لیست بلاگ‌ها برگردون
          router.push('/blog');
        },
      });
    }
  };
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
      <button
        onClick={handleDelete}
        className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
      >
        🗑 حذف بلاگ
      </button>
    </div>
  );
}
