// app/(whatever)/blog/[slug]/edit/page.tsx
'use client';

import { BlogForm, BlogFormType } from '@/components/sections/blog/BlogForm/BlogForm';
import { useBlogs } from '@/hooks/useBlogs';
import { useNotify } from '@/hooks/useNotify';
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
  const notify = useNotify();

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push('/login');
    }
  }, [session, router, isPending]);
  if (isLoading) return <div>Loading...</div>;
  if (!blog) return <div>Not found</div>;
  const isAuthor = blog.authorId === session?.user?.id;
  const isAdmin = session?.user?.role === 'ADMIN';

  if (!isAuthor && !isAdmin) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">شما اجازه ویرایش این پست را ندارید.</p>
      </div>
    );
  }

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
      onSuccess: () => {
        notify.success('بلاگ با موفقیت ویرایش شد ✅');
        router.push('/blog');
      },
      onError: (error: any) => {
        if (error.response?.status === 403) {
          notify.error('شما اجازه ویرایش این پست را ندارید');
        } else {
          notify.error('خطا در ویرایش بلاگ');
        }
        console.error(error);
      },
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
    </div>
  );
}
