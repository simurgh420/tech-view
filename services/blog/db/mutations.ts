// services/blog/db/mutations.ts
import { calculateReadingMinutes, generateUniqueSlug, toSlug } from '@/lib/slug';
import prisma from '@/services/db/client';
import { deleteImage } from '@/services/upload/deleteImage';

import { authorSelect } from '../authorSelect';
import { CreateBlogInput, UpdateBlogInput } from '@/lib/validation/blog';

// ساخت بلاگ جدید
export async function createBlogPost(data: CreateBlogInput) {
  const baseSlug = toSlug(data.title);
  const uniqueSlug = await generateUniqueSlug(baseSlug);
  return prisma.blogPost.create({
    data: {
      title: data.title,
      slug: uniqueSlug,
      excerpt: data.excerpt,
      content: data.content,
      coverImageUrl: data.coverImageUrl ?? null,
      readingMinutes: calculateReadingMinutes(data.content),
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      authorId: data.authorId,
      status: data.status,
      tags: {
        create: data.tags.map(tagName => ({
          tag: {
            connectOrCreate: {
              where: { slug: toSlug(tagName) },
              create: { name: tagName, slug: toSlug(tagName) },
            },
          },
        })),
      },
    },
    include: {
      author: {
        select: authorSelect,
      },
      tags: { include: { tag: true } },
    },
  });
}

// ویرایش بلاگ
export async function updatePost(slug: string, data: UpdateBlogInput) {
  const existingPost = await prisma.blogPost.findUnique({
    where: { slug },
    include: { tags: true },
  });
  if (!existingPost) return null;

  // ذخیره تصویر قدیمی در صورت نیاز به حذف (بعد از تراکنش)
  let oldImageUrl: string | null = null;
  if (
    data.coverImageUrl !== undefined &&
    existingPost.coverImageUrl &&
    existingPost.coverImageUrl !== data.coverImageUrl
  ) {
    oldImageUrl = existingPost.coverImageUrl;
  }

  // اجرای تراکنش برای دیتابیس (بدون حذف فیزیکی فایل)
  const updatedPost = await prisma.$transaction(async tx => {
    const updateData: any = {};

    // عنوان و اسلاگ
    if (data.title !== undefined) {
      updateData.title = data.title;
      let newSlug = toSlug(data.title);
      const slugConflict = await tx.blogPost.findFirst({
        where: { slug: newSlug, id: { not: existingPost.id } },
      });
      if (slugConflict) {
        newSlug = await generateUniqueSlug(newSlug, existingPost.id);
      }
      updateData.slug = newSlug;
    }

    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;

    if (data.content !== undefined) {
      updateData.content = data.content;
      updateData.readingMinutes = calculateReadingMinutes(data.content);
    }

    // آپدیت تصویر کاور (فقط آدرس جدید، حذف قدیمی بعداً)
    if (data.coverImageUrl !== undefined) {
      updateData.coverImageUrl = data.coverImageUrl;
    }

    // وضعیت انتشار
    if (data.status !== undefined) {
      const oldStatus = existingPost.status;
      updateData.status = data.status;
      if (data.status === 'PUBLISHED' && oldStatus !== 'PUBLISHED') {
        updateData.publishedAt = new Date();
      } else if (data.status !== 'PUBLISHED') {
        updateData.publishedAt = null;
      }
    }

    // به‌روزرسانی فیلدهای اصلی (بدون تگ)
    await tx.blogPost.update({
      where: { id: existingPost.id },
      data: updateData,
    });

    // مدیریت تگ‌ها (اگر ارائه شده باشند)
    if (data.tags !== undefined) {
      const tagsToSet = data.tags;
      await tx.tagOnPost.deleteMany({ where: { postId: existingPost.id } });
      if (tagsToSet.length > 0) {
        await tx.blogPost.update({
          where: { id: existingPost.id },
          data: {
            tags: {
              create: tagsToSet.map(tagName => ({
                tag: {
                  connectOrCreate: {
                    where: { slug: toSlug(tagName) },
                    create: { name: tagName, slug: toSlug(tagName) },
                  },
                },
              })),
            },
          },
        });
      }
    }

    // برگرداندن پست نهایی با include
    return tx.blogPost.findUnique({
      where: { id: existingPost.id },
      include: {
        author: { select: authorSelect },
        tags: { include: { tag: true } },
      },
    });
  });

  // پس از موفقیت تراکنش، تصویر قدیمی را حذف می‌کنیم
  if (oldImageUrl) {
    await deleteImage(oldImageUrl).catch(console.error);
  }

  return updatedPost;
}
// حذف بلاگ
export async function deletePost(slug: string) {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return null;

  if (post.coverImageUrl) {
    await deleteImage(post.coverImageUrl).catch(console.error);
  }

  return prisma.blogPost.delete({ where: { slug } });
}
