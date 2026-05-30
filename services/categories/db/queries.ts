import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

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
