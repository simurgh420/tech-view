//services/blog/mutations
import { calculateReadingMinutes, toSlug } from '@/lib/slug';
import prisma from '@/services/db/client';
import { deleteImage } from '@/services/upload/deleteImage';
import { UpdateBlogData } from '@/types/blog';
import { createBlogSchema } from './schemas/createBlog.schema';
import { updateBlogSchema } from './schemas/updateBlog.schema';

// ساخت بلاگ جدید
export async function createBlogPost(input: unknown) {
  const data = createBlogSchema.parse(input);
  return prisma.blogPost.create({
    data: {
      title: data.title,
      slug: toSlug(data.title),
      excerpt: data.excerpt,
      content: data.content,
      coverImageUrl: data.coverImageUrl ?? null,
      readingMinutes: calculateReadingMinutes(data.content),
      publishedAt: new Date(),
      author: data.author,
      status: 'PUBLISHED',
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
  });
}
// ویرایش بلاگ

export async function updatePost(slug: string, input: unknown) {
  const data = updateBlogSchema.parse(input);
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return null;

  const updateData: UpdateBlogData = {
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    coverImageUrl: data.coverImageUrl,
    author: data.author,
    slug: data.title ? toSlug(data.title) : undefined,
    readingMinutes: data.content ? calculateReadingMinutes(data.content) : undefined,
  };
  if (data.tags) {
    await prisma.tagOnPost.deleteMany({ where: { postId: post.id } });
    updateData.tags = {
      create: data.tags.map(tagName => ({
        tag: {
          connectOrCreate: {
            where: { slug: toSlug(tagName) },
            create: { name: tagName, slug: toSlug(tagName) },
          },
        },
      })),
    };
  }
  return prisma.blogPost.update({
    where: { slug },
    data: updateData,
  });
}
// حذف بلاگ
export async function deletePost(slug: string) {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return null;
  if (post.coverImageUrl) {
    await deleteImage(post.coverImageUrl);
  }
  return prisma.blogPost.delete({ where: { slug } });
}
