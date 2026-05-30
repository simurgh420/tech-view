// src/lib/server/slug.ts

import prisma from '@/services/db/client';

export async function generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  const MAX_ATTEMPTS = 50;

  while (counter <= MAX_ATTEMPTS) {
    const existing = await prisma.blogPost.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  throw new Error(
    `Unable to generate unique slug for "${baseSlug}" after ${MAX_ATTEMPTS} attempts`
  );
}
