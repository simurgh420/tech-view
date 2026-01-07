// app/(whatever)/blog/create/page.tsx
'use client';

import { BlogForm, BlogFormType } from '@/components/sections/blog/BlogForm';
import { useBlogs } from '@/hooks/useBlogs';
import { useSession } from '@/lib/auth-client';
import { toSlug } from '@/lib/slug';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateBlogPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push('/login');
    }
  }, [session, isPending, router]);
  const { useCreateBlog } = useBlogs();
  const createMutation = useCreateBlog();

  async function handleSubmit(data: BlogFormType) {
    if (!userId) return;

    const slug = toSlug(data.title);
    let imageUrl = '';

    if (data.coverImageUrl instanceof File) {
      const formData = new FormData();
      formData.append('file', data.coverImageUrl);
      formData.append('folder', `blogs/${slug}/cover`);
      formData.append('baseName', data.title);

      const res = await axios.post('/api/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      imageUrl = res.data.imageUrl;
    }

    createMutation.mutate(
      {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        tags: data.tags,
        coverImageUrl: imageUrl,
        authorId: userId,
      },
      {
        onSuccess: () => router.push('/blog'),
      }
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-right">✍️ ایجاد بلاگ جدید</h1>

      <BlogForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />

      {createMutation.isError && <p className="text-red-500">خطا در ایجاد بلاگ</p>}
      {createMutation.isSuccess && <p className="text-green-600">بلاگ با موفقیت ایجاد شد ✅</p>}
    </div>
  );
}
