import { generateUniqueSlug } from '@/lib/server/slug';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';
import { CreateCategoryInput, EditCategoryInput } from '@/lib/validation/category';
import { toSlug } from '@/lib/slug-common';

// ---------- ایجاد دسته‌بندی ----------
export async function createCategory(data: CreateCategoryInput) {
  const startTime = Date.now();

  const baseSlug = toSlug(data.title); // همیشه از title می‌سازیم
  const uniqueSlug = await generateUniqueSlug(baseSlug); // و یکتا می‌کنیم

  try {
    const category = await prisma.category.create({
      data: {
        title: data.title,
        slug: uniqueSlug,
        icon: data.icon ?? null,
        parentId: data.parentId ?? null,
        order: 0,
      },
    });

    logger.info('createCategory success', {
      categoryId: category.id,
      title: data.title,
      slug: uniqueSlug,
      duration: Date.now() - startTime,
    });

    return category;
  } catch (error) {
    logger.error('createCategory failed', {
      title: data.title,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

// ---------- ویرایش دسته‌بندی ----------
export async function updateCategory(slug: string, data: EditCategoryInput) {
  const startTime = Date.now();

  try {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing) {
      logger.info('updateCategory: category not found', { slug, duration: Date.now() - startTime });
      return null;
    }

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
      // اگر عنوان تغییر کرده، اسلاگ جدید یکتا بساز
      const newBaseSlug = toSlug(data.title);
      updateData.slug = await generateUniqueSlug(newBaseSlug, existing.id);
    }
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.parentId !== undefined) updateData.parentId = data.parentId;

    const updated = await prisma.category.update({
      where: { slug },
      data: updateData,
    });

    logger.info('updateCategory success', {
      oldSlug: slug,
      newTitle: data.title,
      newSlug: updateData.slug as string | undefined,
      duration: Date.now() - startTime,
    });

    return updated;
  } catch (error) {
    logger.error('updateCategory failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

// ---------- حذف دسته‌بندی ----------
export async function deleteCategory(slug: string) {
  const startTime = Date.now();
  try {
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) {
      logger.info('deleteCategory: category not found', {
        slug,
        duration: Date.now() - startTime,
      });
      return null;
    }

    await prisma.category.delete({ where: { slug } });

    logger.info('deleteCategory success', {
      slug,
      duration: Date.now() - startTime,
    });
    return true;
  } catch (error) {
    logger.error('deleteCategory failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
