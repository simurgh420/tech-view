import { toSlug } from '@/lib/slug';
// services/categories/db/mutations.ts
import prisma from '@/services/db/client';
import { CategoryPayload } from '@/types/category';

export async function createCategory(data: CategoryPayload) {
  return prisma.category.create({
    data: {
      title: data.title,
      slug: toSlug(data.title),
      icon: data.icon,
      order: data.order ?? 0,
      parentId: data.parentId,
    },
  });
}

export async function updateCategory(slug: string, data: Partial<CategoryPayload>) {
  return prisma.category.update({
    where: { slug },
    data: {
      ...data,
      ...(data.title ? { slug: toSlug(data.title) } : {}),
    },
  });
}

export async function deleteCategory(slug: string) {
  await prisma.category.delete({ where: { slug } });
  return { success: true };
}
