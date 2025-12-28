// services/categories/db/mutations.ts
import prisma from '@/services/db/client';
import { CategoryPayload } from '@/types/category';

export async function createCategory(data: CategoryPayload) {
  return prisma.category.create({ data });
}

export async function updateCategoryBySlug(slug: string, data: Partial<CategoryPayload>) {
  return prisma.category.update({ where: { slug }, data });
}

export async function deleteCategoryBySlug(slug: string) {
  await prisma.category.delete({ where: { slug } });
  return { success: true };
}
