// services/blog/utils/formatBlogPost.ts
import { Prisma } from '@/app/generated/prisma/client';
import type { BlogPostSafe } from '@/types/blog';
import { authorSelect } from '../authorSelect';

export type BlogPostWithRelations = Prisma.BlogPostGetPayload<{
  include: {
    author: { select: typeof authorSelect };
    tags: { include: { tag: true } };
  };
}>;
export function formatBlogPost(raw: BlogPostWithRelations): BlogPostSafe {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    excerpt: raw.excerpt,
    coverImageUrl: raw.coverImageUrl ?? null,
    readingMinutes: raw.readingMinutes,
    publishedAt: raw.publishedAt ?? null,
    authorName: raw.author?.name ?? null,
    tags: (raw.tags ?? []).map((t: any) => t.tag.name),
  };
}
