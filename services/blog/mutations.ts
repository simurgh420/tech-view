// services/blog/mutations.ts
import { calculateReadingMinutes, toSlug } from '@/lib/slug';
import prisma from '../db/client';

export async function createBlogPost({
  title,
  excerpt,
  content,
  coverImageUrl,
  author,
}: {
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  author: string;
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
    },
  });
}
