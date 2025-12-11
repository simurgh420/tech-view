// src/server/blog/queries.ts
import prisma from '@/services/db/client';
export type BlogPostSafe = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  readingMinutes: number;
  publishedAt: Date;
  author: string;
  tags: string[];
};
export async function getPublishedPosts(params: { page?: number; pageSize?: number }): Promise<{
  items: BlogPostSafe[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}> {
  const page = params.page ?? 1;
  const take = params.pageSize ?? 10;
  const skip = (page - 1) * take;
  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      skip,
      take,
      include: { tags: { include: { tag: true } } },
    }),
    prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
  ]);
  const safeItems = items.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl,
    readingMinutes: post.readingMinutes,
    publishedAt: post.publishedAt,
    author: post.author,
    tags: post.tags.map(t => t.tag.name),
  }));
  return { items: safeItems, total, page, pageSize: take, pages: Math.ceil(total / take) };
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      coverImageUrl: true,
      author: true,
      publishedAt: true,
      readingMinutes: true,
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}
export async function getRecentPosts(limit = 3) {
  return prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
      coverImageUrl: true,
    },
  });
}

export async function getUsedTags() {
  const tags = await prisma.tag.findMany({
    where: {
      posts: {
        some: {}, // فقط تگ‌هایی که حداقل در یک پست استفاده شدن
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return tags;
}
