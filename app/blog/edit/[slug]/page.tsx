// app/(whatever)/blog/[slug]/edit/page.tsx
'use client';

import { BlogForm, BlogFormType } from '@/components/sections/blog/BlogForm';
import { useBlogs } from '@/hooks/useBlogs';
import { useSession } from '@/lib/auth-client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';

export default function EditBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { useGetBlog, useUpdateBlog } = useBlogs();

  const { data: blog, isLoading } = useGetBlog(slug);
  const updateMutation = useUpdateBlog(slug);
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push('/login');
    }
  }, [session, router, isPending]);
  if (isLoading) return <div>Loading...</div>;
  if (!blog) return <div>Not found</div>;

  const initialValues = {
    title: blog.title,
    excerpt: blog.excerpt,
    coverImageUrl: blog.coverImageUrl,
    content: blog.content,
    tags: blog.tags.map(t => t.tag.name),
  };

  async function handleSubmit(data: BlogFormType) {
    let imageUrl: string = blog?.coverImageUrl ?? '';

    if (data.coverImageUrl instanceof File) {
      const formData = new FormData();
      formData.append('file', data.coverImageUrl);
      formData.append('folder', `blogs/${slug}/cover`);
      formData.append('baseName', data.title);

      const res = await axios.post('/api/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      imageUrl = res.data.imageUrl;

      if (blog?.coverImageUrl) {
        await axios.post('/api/images/delete', {
          imagePath: blog.coverImageUrl,
        });
      }
    }

    const payload = {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      tags: data.tags,
      coverImageUrl: imageUrl,
    };

    updateMutation.mutate(payload, {
      onSuccess: () => router.push('/blog'),
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mt-6">ویرایش بلاگ✏️</h1>
      <BlogForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
      />
      {updateMutation.isError && <p className="text-red-500 mt-4">خطا در ویرایش بلاگ</p>}
      {updateMutation.isSuccess && (
        <p className="text-green-600 mt-4">بلاگ با موفقیت ویرایش شد ✅</p>
      )}
    </div>
  );
}
