// services/categories/db/mutations.ts
import { toSlug } from '@/lib/slug';
import { CreateCategoryInput, EditCategoryInput } from '@/lib/validation/category';
import prisma from '@/services/db/client';

export async function createCategory(data: CreateCategoryInput) {
  return prisma.category.create({
    data: {
      title: data.title,
      slug: toSlug(data.title),
      icon: data.icon ?? null,
      parentId: data.parentId,
      order: 0,
    },
  });
}

export async function updateCategory(slug: string, data: EditCategoryInput) {
  // ۱. اگر عنوانی در داده نیست، اسلاگ تغییری نمی‌کند

  if (data.title === undefined) {
    return prisma.category.update({
      where: { slug },
      data,
    });
  }
  // ۲. عنوان جدید داریم؛ رکورد فعلی را بخوانیم تا عنوان قبلی را داشته باشیم
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (!existing) return null;

  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
    if (data.title !== existing.title) {
      updateData.slug = toSlug(data.title); // فقط در صورت تغییر نام
    }
  }
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.parentId !== undefined) updateData.parentId = data.parentId;

  return prisma.category.update({
    where: { slug },
    data: updateData,
  });
}
export async function deleteCategory(slug: string) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return null;
  await prisma.category.delete({ where: { slug } });
  return true;
}
