//services/blog/mutations
import { calculateReadingMinutes, toSlug } from '@/lib/slug';
import prisma from '../db/client';

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
  // اول همه تگ‌ها رو آماده می‌کنیم
  const tagConnections = await Promise.all(
    tags.map(async tagName => {
      const slug = toSlug(tagName);

      let tag = await prisma.tag.findUnique({ where: { slug } });

      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: tagName, slug },
        });
      }

      return { tag: { connect: { id: tag.id } } };
    })
  );

  // بعد بلاگ رو می‌سازیم و تگ‌ها رو وصل می‌کنیم
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
        create: tagConnections,
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
    await prisma.tagOnPost.deleteMany({ where: { postId: post.id } });

    // ساختن رابطه‌های جدید
    const tagConnections = await Promise.all(
      data.tags.map(async tagName => {
        const slug = toSlug(tagName);
        let tag = await prisma.tag.findUnique({ where: { slug } });
        if (!tag) {
          tag = await prisma.tag.create({ data: { name: tagName, slug } });
        }
        return { tag: { connect: { id: tag.id } } };
      })
    );

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
          create: tagConnections,
        },
      },
    });
  }

  // اگر تگ‌ها تغییر نکرده باشن
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
    },
  });
}
// حذف بلاگ
export async function deletePost(slug: string) {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return null;
  await prisma.tagOnPost.deleteMany({ where: { postId: post.id } });
  return prisma.blogPost.delete({ where: { slug } });
}
