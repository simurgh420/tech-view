//services/blog/mutations
import { calculateReadingMinutes, toSlug } from '@/lib/slug';
import prisma from '@/services/db/client';
import { deleteImage } from '@/services/upload/deleteImage';
import { UpdateBlogData } from '@/types/blog';

// ساخت بلاگ جدید
export async function createBlogPost({
  title,
  excerpt,
  content,
  coverImageUrl,
  author,
  tags,
}: {
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  author: string;
  tags: string[];
}) {
  return prisma.blogPost.create({
    data: {
      title,
      slug: toSlug(title),
      excerpt,
      content,
      coverImageUrl,
      readingMinutes: calculateReadingMinutes(content),
      publishedAt: new Date(),
      author,
      status: 'PUBLISHED',
      tags: {
        create: tags.map(tagName => ({
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

export async function updatePost(
  slug: string,
  data: {
    title?: string;
    excerpt?: string;
    content?: string;
    coverImageUrl?: string;
    author?: string;
    tags?: string[];
  }
) {
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
