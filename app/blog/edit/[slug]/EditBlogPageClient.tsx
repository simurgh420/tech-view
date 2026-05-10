// app/(whatever)/blog/[slug]/EditBlogPageClient.tsx

'use client';

import { BlogForm } from '@/components/sections/blog/BlogForm/BlogForm';
import { useBlogs } from '@/hooks/useBlogs';
import { useNotify } from '@/hooks/useNotify';
import { blogFormSchema, BlogFormType } from '@/lib/validation/blog';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

interface EditBlogFormProps {
  slug: string;
  blog: {
    title: string;
    excerpt: string;
    coverImageUrl: string | null;
    content: string;
    tags: string[];
  };
}

export function EditBlogPageClient({ slug, blog }: EditBlogFormProps) {
  const router = useRouter();
  const { useUpdateBlog } = useBlogs();
  const updateMutation = useUpdateBlog(slug);
  const notify = useNotify();
  const form = useForm<BlogFormType>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: blog.title,
      excerpt: blog.excerpt,
      coverImageUrl: blog.coverImageUrl ?? undefined,
      content: blog.content,
      tags: blog.tags,
    },
  });
  async function handleSubmit(data: BlogFormType) {
    let imageUrl: string = blog.coverImageUrl ?? '';

    if (data.coverImageUrl instanceof File) {
      const formData = new FormData();
      formData.append('file', data.coverImageUrl);
      formData.append('folder', `blogs/${slug}/cover`);
      formData.append('baseName', data.title);
      const res = await axios.post('/api/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      imageUrl = res.data.imageUrl;

      if (blog.coverImageUrl) {
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
    <BlogForm
      form={form}
      initialValues={{
        title: blog.title,
        excerpt: blog.excerpt,
        coverImageUrl: blog.coverImageUrl,
        content: blog.content,
        tags: blog.tags,
      }}
      onSubmit={handleSubmit}
      isLoading={updateMutation.isPending}
    />
  );
}
