// app/(whatever)/blog/edit/[slug]/EditBlogPageClient.tsx

'use client';

import { BlogForm } from '@/features/blog/components/BlogForm/BlogForm';
import { useUpdateBlog } from '@/features/blog/hooks/useBlogs';
import { useNotify } from '@/hooks/useNotify';
import { logger } from '@/lib/logger';
import { sanitizeUrl } from '@/lib/utils';
import { blogFormSchema, BlogFormType, UpdateBlogInput } from '@/features/blog/schemas/blog';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadImage, deleteImage } from '@/features/upload/client/images';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

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
  const updateMutation = useUpdateBlog(slug);
  const notify = useNotify();
  const [isUploading, setIsUploading] = useState(false);
  const form = useForm<BlogFormType>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: blog.title,
      excerpt: blog.excerpt,
      coverImageUrl: blog.coverImageUrl,
      content: blog.content,
      tags: blog.tags,
    },
  });

  async function handleSubmit(data: BlogFormType) {
    // مقدار پیش‌فرض: بدون تغییر → فیلد اصلاً در payload قرار نمی‌گیرد
    let imageUrl: string | null | undefined = undefined;
    let oldImageToDelete: string | null = null;

    setIsUploading(true);

    try {
      if (data.coverImageUrl instanceof File) {
        // کاربر فایل جدید انتخاب کرده → آپلود
        const uploaded = await uploadImage(data.coverImageUrl, `blogs/${slug}/cover`, data.title);

        const safe = sanitizeUrl(uploaded);
        if (!safe) throw new Error('Invalid uploaded image URL');

        imageUrl = safe;
        oldImageToDelete = blog.coverImageUrl;
      } else if (data.coverImageUrl === null) {
        // کاربر عکس موجود را حذف کرده
        imageUrl = null;
        oldImageToDelete = blog.coverImageUrl;
      } else if (typeof data.coverImageUrl === 'string') {
        // فقط اگر مقدار واقعاً از مقدار اولیه فرق کرده باشد
        if (data.coverImageUrl !== blog.coverImageUrl) {
          const safe = sanitizeUrl(data.coverImageUrl);
          if (!safe) throw new Error('Invalid cover image URL');

          imageUrl = safe;
          oldImageToDelete = blog.coverImageUrl;
        }
        // else: بدون تغییر
      }
      // undefined → بدون تغییر
    } catch (error) {
      logger.error(error instanceof Error ? error.message : String(error));
      notify.error('خطا در آپلود تصویر کاور');
      return;
    } finally {
      setIsUploading(false);
    }

    // payload: فیلد coverImageUrl فقط اگر تغییر کرده باشد
    const payload: UpdateBlogInput = {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      tags: data.tags,
    };
    if (imageUrl !== undefined) {
      payload.coverImageUrl = imageUrl;
    }

    updateMutation.mutate(payload, {
      onSuccess: async updated => {
        // حذف فایل قدیمی فقط اگر واقعاً عوض شده باشد
        if (oldImageToDelete && oldImageToDelete !== imageUrl) {
          try {
            await deleteImage(oldImageToDelete);
          } catch (error) {
            logger.error(error instanceof Error ? error.message : String(error));
          }
        }

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

        logger.error(error instanceof Error ? error.message : String(error));
      },
    });
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
      isLoading={isUploading || updateMutation.isPending}
    />
  );
}
