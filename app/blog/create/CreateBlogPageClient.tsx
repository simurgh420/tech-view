'use client';

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { BlogForm } from '@/features/blog/components/BlogForm/BlogForm';
import { useCreateBlog } from '@/features/blog/hooks/useBlogs';

import { useNotify } from '@/hooks/useNotify';
import { logger } from '@/lib/logger';
import { sanitizeUrl } from '@/lib/utils';
import { toSlug } from '@/lib/slug-common';

import { blogFormSchema } from '@/features/blog/schemas/blog';
import type { BlogFormType } from '@/features/blog/schemas/blog';

import { uploadImage } from '@/features/upload/client/images';

export function CreateBlogPageClient() {
  const router = useRouter();
  const createMutation = useCreateBlog();
  const notify = useNotify();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BlogFormType>({
    resolver: zodResolver(blogFormSchema),

    defaultValues: {
      title: '',
      excerpt: '',
      coverImageUrl: null,
      content: '',
      tags: [],
    },
  });

  async function handleSubmit(data: BlogFormType) {
    // جلوگیری از ارسال چندباره فرم
    if (isSubmitting || createMutation.isPending) return;

    const slug = toSlug(data.title);

    let imageUrl: string | null = null;

    setIsSubmitting(true);

    try {
      if (data.coverImageUrl instanceof File) {
        // آپلود تصویر جدید
        const uploadedImageUrl = await uploadImage(
          data.coverImageUrl,
          `blogs/${slug}/cover`,
          data.title
        );

        // اعتبارسنجی URL دریافت‌شده
        const safeUrl = sanitizeUrl(uploadedImageUrl);

        if (!safeUrl) {
          throw new Error('Invalid uploaded image URL');
        }

        imageUrl = safeUrl;
      } else if (typeof data.coverImageUrl === 'string') {
        // در صورت وجود URL معتبر
        const safeUrl = sanitizeUrl(data.coverImageUrl);

        if (!safeUrl) {
          throw new Error('Invalid cover image URL');
        }

        imageUrl = safeUrl;
      }

      // null یا undefined یعنی بلاگ بدون تصویر ایجاد شود
    } catch (error) {
      logger.error(error instanceof Error ? error.message : String(error));

      notify.error('خطا در آپلود تصویر کاور');
      setIsSubmitting(false);

      return;
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
              if (typeof field === 'string' && field in blogFormSchema.shape) {
                form.setError(field as keyof BlogFormType, {
                  message,
                });
              }
            });

            notify.error('لطفاً خطاهای فرم را بررسی کنید');
          } else {
            notify.error('خطا در ایجاد بلاگ');
          }

          logger.error(error instanceof Error ? error.message : String(error));
        },

        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
  }

  return (
    <BlogForm
      form={form}
      onSubmit={handleSubmit}
      isLoading={isSubmitting || createMutation.isPending}
    />
  );
}
