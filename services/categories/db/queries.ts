// services/categories/db/queries.ts
import prisma from '@/services/db/client';

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { order: 'asc' },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      products: { orderBy: { createdAt: 'desc' } },
      children: true,
    },
  });
}
