// app/(whatever)/blog/[slug]/edit/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BlogForm } from '@/components/sections/blog/BlogForm/BlogForm';
import { useBlogs } from '@/hooks/useBlogs';
import { useNotify } from '@/hooks/useNotify';
import { useSession } from '@/lib/auth-client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import { blogFormSchema, BlogFormType } from '@/lib/validation/blog';

export default function EditBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { useGetBlog, useUpdateBlog } = useBlogs();
  const { data: blog, isLoading } = useGetBlog(slug);
  const updateMutation = useUpdateBlog(slug);
  const { data: session, isPending } = useSession();
  const notify = useNotify();

  // ✅ فرم را اینجا (قبل از هر return) می‌سازیم
  const form = useForm<BlogFormType>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      coverImageUrl: undefined,
      content: '',
      tags: [],
    },
  });

  // با تغییر blog، مقادیر فرم را بازنشانی کن
  useEffect(() => {
    if (blog) {
      form.reset({
        title: blog.title,
        excerpt: blog.excerpt,
        coverImageUrl: blog.coverImageUrl ?? undefined,
        content: blog.content,
        tags: blog.tags.map(t => t.tag.name),
      });
    }
  }, [blog, form]);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  // حالا می‌توانیم returnهای شرطی داشته باشیم
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
        await axios.post('/api/images/delete', { imagePath: blog.coverImageUrl });
      }
    }

    updateMutation.mutate(
      {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        tags: data.tags,
        coverImageUrl: imageUrl,
      },
      {
        onSuccess: updated => {
          notify.success('بلاگ با موفقیت ویرایش شد ✅');
          if (updated.slug !== slug) {
            router.push(`/blog/${updated.slug}`);
          } else {
            router.push('/blog/');
          }
        },
        onError: (error: any) => {
          if (error?.response?.status === 403) {
            notify.error('شما اجازه ویرایش این پست را ندارید');
            return;
          }

          const details = error?.response?.data?.details;
          if (Array.isArray(details)) {
            details.forEach(({ field, message }: { field: string; message: string }) => {
              if (field in blogFormSchema.shape) {
                form.setError(field as keyof BlogFormType, { message });
              }
            });
            notify.error('لطفاً خطاهای فرم را بررسی کنید');
          } else {
            notify.error('خطا در ویرایش بلاگ');
          }
          console.error(error);
        },
      }
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mt-6">ویرایش بلاگ✏️</h1>
      <BlogForm
        form={form}
        initialValues={{
          title: blog.title,
          excerpt: blog.excerpt,
          coverImageUrl: blog.coverImageUrl,
          content: blog.content,
          tags: blog.tags.map(t => t.tag.name),
        }}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
