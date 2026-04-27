// app/(whatever)/blog/create/page.tsx
'use client';

import { BlogForm } from '@/components/sections/blog/BlogForm/BlogForm';
import { useBlogs } from '@/hooks/useBlogs';
import { useNotify } from '@/hooks/useNotify';
import { useSession } from '@/lib/auth-client';
import { toSlug } from '@/lib/slug';
import { blogFormSchema, BlogFormType } from '@/lib/validation/blog';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function CreateBlogPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const notify = useNotify();
  const { useCreateBlog } = useBlogs();
  const createMutation = useCreateBlog();

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

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  async function handleSubmit(data: BlogFormType) {
    if (!userId) {
      notify.info('لطفاً منتظر بمانید...');
      return;
    }

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
      },
      {
        onSuccess: () => {
          notify.success('بلاگ با موفقیت ایجاد شد ✅');
          router.push('/blog');
        },
        onError: (error: any) => {
          const details = error?.response?.data?.details;
          if (Array.isArray(details)) {
            details.forEach(({ field, message }: { field: string; message: string }) => {
              if (field in blogFormSchema.shape) {
                form.setError(field as keyof BlogFormType, { message });
              }
            });
            notify.error('لطفاً خطاهای فرم را بررسی کنید');
          } else {
            notify.error('خطا در ایجاد بلاگ');
          }
          console.error(error);
        },
      }
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-right">✍️ ایجاد بلاگ جدید</h1>

      <BlogForm
        form={form}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || isPending}
      />
    </div>
  );
}
