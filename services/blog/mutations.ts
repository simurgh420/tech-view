import { calculateReadingMinutes, toSlug } from '@/lib/slug';
import prisma from '../db/client';
import { slugify } from 'transliteration';

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
      const slug = slugify(tagName, { separator: '-', trim: true }).toLowerCase();

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
