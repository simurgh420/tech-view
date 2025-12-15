//services/blog/mutations
import { calculateReadingMinutes, toSlug } from '@/lib/slug';
import prisma from '../../db/client';

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

  // اگر تگ‌ها تغییر کردن
  if (data.tags && data.tags.length > 0) {
    // پاک کردن ارتباط‌های قبلی
    await prisma.tagOnPost.deleteMany({ where: { postId: post.id } });

    return prisma.blogPost.update({
      where: { slug },
      data: {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        coverImageUrl: data.coverImageUrl,
        author: data.author,
        slug: data.title ? toSlug(data.title) : undefined,
        readingMinutes: data.content ? calculateReadingMinutes(data.content) : undefined,
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
}
// حذف بلاگ
export async function deletePost(slug: string) {
  return prisma.blogPost.delete({ where: { slug } });
}
