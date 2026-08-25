// services/categories/db/mutations.ts

import { generateUniqueSlug } from '@/lib/server/slug';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';
import { CreateCategoryInput, EditCategoryInput } from '@/lib/validation/category';
import { toSlug } from '@/lib/slug-common';

// ---------- ایجاد دسته‌بندی ----------

export async function createCategory(data: CreateCategoryInput) {
  const startTime = Date.now();

  const baseSlug = toSlug(data.title);
  const uniqueSlug = await generateUniqueSlug(baseSlug);

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
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (!existing) {
      logger.info('updateCategory: category not found', {
        slug,
        duration: Date.now() - startTime,
      });

      return null;
    }

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) {
      updateData.title = data.title;

      const newBaseSlug = toSlug(data.title);

      updateData.slug = await generateUniqueSlug(newBaseSlug, existing.id);
    }

    if (data.icon !== undefined) {
      updateData.icon = data.icon;
    }

    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId;
    }

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
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      logger.info('deleteCategory: category not found', {
        slug,
        duration: Date.now() - startTime,
      });

      return null;
    }

    await prisma.category.delete({
      where: { slug },
    });

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

// ---------- افزودن مشخصه به دسته‌بندی ----------

export async function addCategoryAttributeAdmin(data: {
  categoryId: string;
  attributeId: string;
  isRequired?: boolean;
  isFilterable?: boolean;
}) {
  const startTime = Date.now();

  try {
    const result = await prisma.$transaction(async tx => {
      const attributeExists = await tx.attribute.findUnique({
        where: { id: data.attributeId },
        select: { id: true },
      });

      if (!attributeExists) {
        throw new Error('ATTRIBUTE_NOT_FOUND');
      }

      const existing = await tx.categoryAttribute.findFirst({
        where: {
          categoryId: data.categoryId,
          attributeId: data.attributeId,
        },
        select: { id: true },
      });

      if (existing) {
        throw new Error('ATTRIBUTE_ALREADY_ASSIGNED');
      }

      const lastAttribute = await tx.categoryAttribute.findFirst({
        where: { categoryId: data.categoryId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      return tx.categoryAttribute.create({
        data: {
          categoryId: data.categoryId,
          attributeId: data.attributeId,
          order: (lastAttribute?.order ?? 0) + 1,
          isRequired: data.isRequired ?? false,
          isFilterable: data.isFilterable ?? false,
        },
      });
    });

    logger.info('addCategoryAttributeAdmin success', {
      categoryId: data.categoryId,
      attributeId: data.attributeId,
      duration: Date.now() - startTime,
    });

    return result;
  } catch (error) {
    logger.error('addCategoryAttributeAdmin failed', {
      categoryId: data.categoryId,
      attributeId: data.attributeId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

// ---------- ویرایش تنظیمات مشخصه‌ی دسته‌بندی ----------

export async function updateCategoryAttributeAdmin(
  id: string,
  data: {
    isRequired?: boolean;
    isFilterable?: boolean;
    order?: number;
  }
) {
  const startTime = Date.now();

  try {
    const result = await prisma.categoryAttribute.update({
      where: { id },
      data,
    });

    logger.info('updateCategoryAttributeAdmin success', {
      id,
      duration: Date.now() - startTime,
    });

    return result;
  } catch (error) {
    logger.error('updateCategoryAttributeAdmin failed', {
      id,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

// ---------- حذف مشخصه از دسته‌بندی ----------

export async function deleteCategoryAttributeAdmin(id: string) {
  const startTime = Date.now();

  try {
    await prisma.categoryAttribute.delete({
      where: { id },
    });

    logger.info('deleteCategoryAttributeAdmin success', {
      id,
      duration: Date.now() - startTime,
    });

    return true;
  } catch (error) {
    logger.error('deleteCategoryAttributeAdmin failed', {
      id,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

// ---------- تغییر ترتیب مشخصات ----------

export async function reorderCategoryAttributesAdmin(
  categoryId: string,
  items: Array<{
    id: string;
    order: number;
  }>
) {
  const startTime = Date.now();

  try {
    await prisma.$transaction(
      items.map(item =>
        prisma.categoryAttribute.updateMany({
          where: {
            id: item.id,
            categoryId,
          },
          data: {
            order: item.order,
          },
        })
      )
    );

    logger.info('reorderCategoryAttributesAdmin success', {
      categoryId,
      count: items.length,
      duration: Date.now() - startTime,
    });

    return true;
  } catch (error) {
    logger.error('reorderCategoryAttributesAdmin failed', {
      categoryId,
      count: items.length,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}
