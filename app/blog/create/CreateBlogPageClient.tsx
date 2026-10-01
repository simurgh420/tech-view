'use client';

import { BlogForm } from '@/components/sections/blog/BlogForm/BlogForm';
import { useCreateBlog } from '@/hooks/useBlogs';
import { useNotify } from '@/hooks/useNotify';
import { logger } from '@/lib/logger';
import { toSlug } from '@/lib/slug-common';
import { blogFormSchema, BlogFormType } from '@/lib/validation/blog';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadImage } from '@/services/upload/api/images';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export function CreateBlogPageClient() {
  const router = useRouter();
  const createMutation = useCreateBlog();
  const notify = useNotify();

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

  async function handleSubmit(data: BlogFormType) {
    const slug = toSlug(data.title);

    let imageUrl: string | null = null;

    if (data.coverImageUrl instanceof File) {
      imageUrl = await uploadImage(data.coverImageUrl, `blogs/${slug}/cover`, data.title);
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

          logger.error(error);
        },
      }
    );
  }

  return <BlogForm form={form} onSubmit={handleSubmit} isLoading={createMutation.isPending} />;
}
