import prisma from '@/services/db/client';
import { BlogPostSafe } from '@/types/blog';
import { authorSelect } from '../authorSelect';
import { logger } from '@/lib/logger';

export async function getPublishedPosts(params: { page?: number; pageSize?: number }) {
  const startTime = Date.now();
  try {
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

    logger.info('getPublishedPosts success', {
      page,
      pageSize: take,
      count: safeItems.length,
      total,
      duration: Date.now() - startTime,
    });
    return {
      items: safeItems,
      total,
      page,
      pageSize: take,
      pages: Math.ceil(total / take),
    };
  } catch (error) {
    logger.error('getPublishedPosts failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getPostBySlug(slug: string) {
  const startTime = Date.now();
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: authorSelect },
        tags: { include: { tag: true } },
      },
    });
    if (!post) {
      logger.info('getPostBySlug: not found', { slug, duration: Date.now() - startTime });
      return null;
    }
    logger.info('getPostBySlug success', { slug, duration: Date.now() - startTime });
    return post;
  } catch (error) {
    logger.error('getPostBySlug failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getRecentPosts(limit = 3) {
  const startTime = Date.now();
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: {
        author: { select: authorSelect },
        tags: { include: { tag: true } },
      },
    });
    logger.info('getRecentPosts success', {
      limit,
      count: posts.length,
      duration: Date.now() - startTime,
    });
    return posts;
  } catch (error) {
    logger.error('getRecentPosts failed', {
      limit,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getUsedTags() {
  const startTime = Date.now();
  try {
    const tags = await prisma.tag.findMany({
      where: {
        posts: { some: {} },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'asc' },
    });
    logger.info('getUsedTags success', { count: tags.length, duration: Date.now() - startTime });
    return tags;
  } catch (error) {
    logger.error('getUsedTags failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getTagsByPostId(postId: string) {
  const startTime = Date.now();
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });
    if (!post) {
      logger.info('getTagsByPostId: post not found', { postId, duration: Date.now() - startTime });
      return [];
    }
    const tags = post.tags.map(t => t.tag);
    logger.info('getTagsByPostId success', {
      postId,
      count: tags.length,
      duration: Date.now() - startTime,
    });
    return tags;
  } catch (error) {
    logger.error('getTagsByPostId failed', {
      postId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
