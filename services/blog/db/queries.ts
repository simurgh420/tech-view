// src/server/blog/db/queries.ts
import prisma from '@/services/db/client';
import { BlogPostSafe } from '@/types/blog';
import { authorSelect } from '../authorSelect';

export async function getPublishedPosts(params: { page?: number; pageSize?: number }) {
  const page = params.page ?? 1;
  const take = params.pageSize ?? 10;
  const skip = (page - 1) * take;

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      skip,
      take,
      include: {
        author: { select: authorSelect },
        tags: { include: { tag: true } },
      },
    }),
    prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
  ]);

  const safeItems: BlogPostSafe[] = items.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl,
    readingMinutes: post.readingMinutes,
    publishedAt: post.publishedAt,
    authorName: post.author?.name ?? null,
    tags: post.tags.map(t => t.tag.name),
  }));

  return {
    items: safeItems,
    total,
    page,
    pageSize: take,
    pages: Math.ceil(total / take),
  };
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: { select: authorSelect },
      tags: { include: { tag: true } },
    },
  });
}

export async function getRecentPosts(limit = 3) {
  return prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: {
      author: { select: authorSelect },
      tags: { include: { tag: true } },
    },
  });
}

export async function getUsedTags() {
  return prisma.tag.findMany({
    where: {
      posts: {
        some: {},
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
}

export async function getTagsByPostId(postId: string) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!post) return [];
  return post.tags.map(t => t.tag);
}
