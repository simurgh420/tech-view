'use client';

import { BlogForm, BlogFormType } from '@/components/sections/blog/BlogForm';
import { useBlogs } from '@/hooks/useBlogs';
import { useRouter } from 'next/navigation';

export default function CreateBlogPage() {
  const router = useRouter();
  const { useCreateBlog } = useBlogs();
  const createMutation = useCreateBlog();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">✍️ ایجاد بلاگ جدید</h1>
      <BlogForm
        onSubmit={(data: BlogFormType) =>
          createMutation.mutate(data, {
            onSuccess: () => router.push('/blog'),
          })
        }
      />

      {createMutation.isError && <p className="text-red-500">خطا در ایجاد بلاگ</p>}
      {createMutation.isSuccess && <p className="text-green-600">بلاگ با موفقیت ایجاد شد ✅</p>}
    </div>
  );
}
