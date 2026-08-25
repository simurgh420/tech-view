import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

// ---------- لیست عمومی دسته‌بندی‌ها (فروشگاه) ----------

export async function getCategories() {
  const startTime = Date.now();

  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    });

    logger.info('getCategories success', {
      count: categories.length,
      duration: Date.now() - startTime,
    });

    return categories;
  } catch (error) {
    logger.error('getCategories failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

export async function getCategoryBySlug(slug: string) {
  const startTime = Date.now();

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: { orderBy: { createdAt: 'desc' } },
        children: true,
      },
    });

    if (!category) {
      logger.info('getCategoryBySlug: not found', { slug, duration: Date.now() - startTime });
      return null;
    }

    logger.info('getCategoryBySlug success', {
      slug,
      productCount: category.products?.length ?? 0,
      childrenCount: category.children?.length ?? 0,
      duration: Date.now() - startTime,
    });

    return category;
  } catch (error) {
    logger.error('getCategoryBySlug failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

// ---------- لیست ادمین با تعداد محصولات/مشخصات (برای CategoryList) ----------

export async function getCategoriesAdmin() {
  const startTime = Date.now();

  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
            attributes: true, // اگه اسم relation فرق داره اصلاح کن
          },
        },
      },
    });

    logger.info('getCategoriesAdmin success', {
      count: categories.length,
      duration: Date.now() - startTime,
    });

    return categories;
  } catch (error) {
    logger.error('getCategoriesAdmin failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

// ---------- مشخصات فنی یک دسته (پنل ادمین) ----------

export async function getCategoryAttributesAdmin(slug: string) {
  const startTime = Date.now();

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!category) {
      logger.info('getCategoryAttributesAdmin: category not found', {
        slug,
        duration: Date.now() - startTime,
      });

      return null;
    }

    const categoryAttributes = await prisma.categoryAttribute.findMany({
      where: { categoryId: category.id },
      orderBy: { order: 'asc' },
      include: {
        attribute: {
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    const result = categoryAttributes.map(categoryAttribute => ({
      id: categoryAttribute.id,
      attributeId: categoryAttribute.attributeId,
      key: categoryAttribute.attribute.key,
      label: categoryAttribute.attribute.label,
      type: categoryAttribute.attribute.type,
      unit: categoryAttribute.attribute.unit,
      isRequired: categoryAttribute.isRequired,
      isFilterable: categoryAttribute.isFilterable,
      order: categoryAttribute.order,
      options: categoryAttribute.attribute.options.map(option => option.value),
    }));

    logger.info('getCategoryAttributesAdmin success', {
      slug,
      count: result.length,
      duration: Date.now() - startTime,
    });

    return result;
  } catch (error) {
    logger.error('getCategoryAttributesAdmin failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}
