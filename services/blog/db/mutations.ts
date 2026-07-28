// services/blog/db/mutations.ts
import { generateUniqueSlug } from '@/lib/server/slug';
import prisma from '@/services/db/client';
import { deleteImage } from '@/services/upload/deleteImage';
import { authorSelect } from '../authorSelect';
import { CreateBlogInput, UpdateBlogInput } from '@/lib/validation/blog';
import { logger } from '@/lib/logger';
import { calculateReadingMinutes, toSlug } from '@/lib/slug-common';
import { Prisma } from '@/app/generated/prisma/client';

// ساخت بلاگ جدید
export async function createBlogPost(data: CreateBlogInput) {
  const startTime = Date.now();
  try {
    const baseSlug = toSlug(data.title);
    const uniqueSlug = await generateUniqueSlug(baseSlug);
    const blog = await prisma.blogPost.create({
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
          create: (data.tags ?? []).map(tagName => ({
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
        author: { select: authorSelect },
        tags: { include: { tag: true } },
      },
    });
    logger.info('createBlogPost success', {
      blogId: blog.id,
      authorId: data.authorId,
      status: data.status,
      slug: uniqueSlug,
      duration: Date.now() - startTime,
    });
    return blog;
  } catch (error) {
    logger.error('createBlogPost failed', {
      authorId: data.authorId,
      title: data.title,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

// ویرایش بلاگ
export async function updatePost(slug: string, data: UpdateBlogInput) {
  const startTime = Date.now();

  try {
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
      include: { tags: { include: { tag: true } } },
    });

    if (!existingPost) {
      logger.info('updatePost: post not found', { slug, duration: Date.now() - startTime });
      return null;
    }

    let oldImageUrl: string | null = null;
    if (
      data.coverImageUrl !== undefined &&
      existingPost.coverImageUrl &&
      existingPost.coverImageUrl !== data.coverImageUrl
    ) {
      oldImageUrl = existingPost.coverImageUrl;
    }

    // ✅ محاسبه‌ی slug جدید قبل از شروع تراکنش، خارج از تراکنش
    let newSlug: string | undefined;
    if (data.title !== undefined) {
      const candidateSlug = toSlug(data.title);
      const slugConflict = await prisma.blogPost.findFirst({
        where: { slug: candidateSlug, id: { not: existingPost.id } },
      });
      newSlug = slugConflict
        ? await generateUniqueSlug(candidateSlug, existingPost.id)
        : candidateSlug;
    }

    const updatedPost = await prisma.$transaction(
      async tx => {
        const updateData: Prisma.BlogPostUpdateInput = {};

        if (data.title !== undefined) {
          updateData.title = data.title;
          updateData.slug = newSlug; // از قبل حساب شده
        }

        if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;

        if (data.content !== undefined) {
          updateData.content = data.content;
          updateData.readingMinutes = calculateReadingMinutes(data.content);
        }

        if (data.coverImageUrl !== undefined) {
          updateData.coverImageUrl = data.coverImageUrl;
        }

        if (data.status !== undefined) {
          updateData.status = data.status;
          if (data.status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
            updateData.publishedAt = new Date();
          } else if (data.status !== 'PUBLISHED') {
            updateData.publishedAt = null;
          }
        }

        if (data.tags !== undefined) {
          const uniqueTags = Array.from(
            new Map(data.tags.map(tag => [toSlug(tag), tag.trim()])).values()
          );

          updateData.tags = {
            deleteMany: {},
            create: uniqueTags.map(tagName => ({
              tag: {
                connectOrCreate: {
                  where: { slug: toSlug(tagName) },
                  create: { name: tagName, slug: toSlug(tagName) },
                },
              },
            })),
          };
        }

        return tx.blogPost.update({
          where: { id: existingPost.id },
          data: updateData,
          include: {
            author: { select: authorSelect },
            tags: { include: { tag: true } },
          },
        });
      },
      { timeout: 15000, maxWait: 5000 } // ✅ تایم‌اوت رو هم بیشتر کن
    );

    if (oldImageUrl) {
      await deleteImage(oldImageUrl).catch(err => {
        logger.error('updatePost: failed to delete old image', {
          oldImageUrl,
          error: err instanceof Error ? err.message : 'Unknown',
        });
      });
    }

    logger.info('updatePost success', {
      slug,
      updatedFields: Object.keys(data),
      duration: Date.now() - startTime,
    });

    return updatedPost;
  } catch (error) {
    logger.error('updatePost failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

// حذف بلاگ
export async function deletePost(slug: string) {
  const startTime = Date.now();
  try {
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) {
      logger.info('deletePost: post not found', { slug, duration: Date.now() - startTime });
      return null;
    }

    const deleted = await prisma.blogPost.delete({ where: { slug } });
    if (post.coverImageUrl) {
      await deleteImage(post.coverImageUrl).catch(err => {
        logger.error('deletePost: failed to delete image', {
          imageUrl: post.coverImageUrl,
          error: err instanceof Error ? err.message : 'Unknown',
        });
      });
    }

    logger.info('deletePost success', { slug, duration: Date.now() - startTime });
    return deleted;
  } catch (error) {
    logger.error('deletePost failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
