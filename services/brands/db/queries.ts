// services/brands/db/queries.ts
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

export async function getBrands() {
  const startTime = Date.now();
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: 'desc' },
    });
    logger.info('getBrands success', {
      count: brands.length,
      duration: Date.now() - startTime,
    });
    return brands;
  } catch (error) {
    logger.error('getBrands failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getActiveBrands() {
  const startTime = Date.now();
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    logger.info('getActiveBrands success', {
      count: brands.length,
      duration: Date.now() - startTime,
    });
    return brands;
  } catch (error) {
    logger.error('getActiveBrands failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getBrandBySlug(slug: string) {
  const startTime = Date.now();
  try {
    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        products: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!brand) {
      logger.info('getBrandBySlug: not found', { slug, duration: Date.now() - startTime });
      return null;
    }
    logger.info('getBrandBySlug success', {
      slug,
      productCount: brand.products?.length ?? 0,
      duration: Date.now() - startTime,
    });
    return brand;
  } catch (error) {
    logger.error('getBrandBySlug failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
