// services/categories/db/mutations.ts
import { toSlug } from '@/lib/slug';
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
  // ۱. اگر عنوانی در داده نیست، اسلاگ تغییری نمی‌کند

  if (data.title === undefined) {
    return prisma.category.update({
      where: { slug },
      data,
    });
  }
  // ۲. عنوان جدید داریم؛ رکورد فعلی را بخوانیم تا عنوان قبلی را داشته باشیم
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (!existing) throw new Error('Category not found');
  const newSlug = data.title !== existing.title ? toSlug(data.title) : undefined;
  return prisma.category.update({
    where: { slug },
    data: {
      ...data,
      ...(newSlug ? { slug: newSlug } : {}),
    },
  });
}

export async function deleteCategory(slug: string) {
  await prisma.category.delete({ where: { slug } });
  return { success: true };
}
