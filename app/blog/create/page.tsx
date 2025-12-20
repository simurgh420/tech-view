'use client';

import { BlogForm, BlogFormType } from '@/components/sections/blog/BlogForm';
import { useBlogs } from '@/hooks/useBlogs';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CreateBlogPage() {
  const router = useRouter();
  const { useCreateBlog } = useBlogs();
  const createMutation = useCreateBlog();

  async function handleSubmit(data: BlogFormType) {
    let imageUrl = '';

    // ✅ اگر فایل انتخاب شده بود → آپلود کن
    if (data.coverImageUrl instanceof File) {
      const formData = new FormData();
      formData.append('file', data.coverImageUrl);
      formData.append('folder', 'blog');
      formData.append('baseName', data.title);

      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      imageUrl = res.data.imageUrl;
    }

    // ✅ ارسال داده‌ها به Mutation
    createMutation.mutate(
      {
        ...data,
        coverImageUrl: imageUrl,
      },
      {
        onSuccess: () => router.push('/blog'),
      }
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">✍️ ایجاد بلاگ جدید</h1>

      <BlogForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />

      {createMutation.isError && <p className="text-red-500">خطا در ایجاد بلاگ</p>}
      {createMutation.isSuccess && <p className="text-green-600">بلاگ با موفقیت ایجاد شد ✅</p>}
    </div>
  );
}
