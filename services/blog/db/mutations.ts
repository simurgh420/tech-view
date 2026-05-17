// services/blog/db/mutations.ts
import { generateUniqueSlug } from '@/lib/server/slug';
import prisma from '@/services/db/client';
import { deleteImage } from '@/services/upload/deleteImage';
import { authorSelect } from '../authorSelect';
import { CreateBlogInput, UpdateBlogInput } from '@/lib/validation/blog';
import { logger } from '@/lib/logger';
import { calculateReadingMinutes, toSlug } from '@/lib/slug-common';

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
      include: { tags: true },
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

    const updatedPost = await prisma.$transaction(async tx => {
      const updateData: any = {};

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
      if (data.coverImageUrl !== undefined) updateData.coverImageUrl = data.coverImageUrl;

      if (data.status !== undefined) {
        const oldStatus = existingPost.status;
        updateData.status = data.status;
        if (data.status === 'PUBLISHED' && oldStatus !== 'PUBLISHED') {
          updateData.publishedAt = new Date();
        } else if (data.status !== 'PUBLISHED') {
          updateData.publishedAt = null;
        }
      }

      await tx.blogPost.update({
        where: { id: existingPost.id },
        data: updateData,
      });

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

      return tx.blogPost.findUnique({
        where: { id: existingPost.id },
        include: {
          author: { select: authorSelect },
          tags: { include: { tag: true } },
        },
      });
    });

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

    if (post.coverImageUrl) {
      await deleteImage(post.coverImageUrl).catch(err => {
        logger.error('deletePost: failed to delete image', {
          imageUrl: post.coverImageUrl,
          error: err instanceof Error ? err.message : 'Unknown',
        });
      });
    }

    const deleted = await prisma.blogPost.delete({ where: { slug } });
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
