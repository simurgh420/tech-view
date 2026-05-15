// services/brands/db/mutations.ts
import prisma from '@/services/db/client';
import { toSlug } from '@/lib/slug';
import { BrandPayload } from '@/types/brand';
import { logger } from '@/lib/logger';

export async function createBrand(data: BrandPayload) {
  const startTime = Date.now();
  try {
    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug: toSlug(data.name),
        logo: data.logo || null,
        isActive: data.isActive ?? true,
      },
    });
    logger.info('createBrand success', {
      brandId: brand.id,
      name: brand.name,
      duration: Date.now() - startTime,
    });
    return brand;
  } catch (error) {
    logger.error('createBrand failed', {
      name: data.name,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function updateBrandBySlug(slug: string, data: Partial<BrandPayload>) {
  const startTime = Date.now();
  try {
    // اگر نام تغییر کند، اسلاگ به‌طور خودکار به‌روز نمی‌شود – عمدی است.
    const brand = await prisma.brand.update({
      where: { slug },
      data,
    });
    logger.info('updateBrandBySlug success', {
      slug,
      updatedFields: Object.keys(data),
      duration: Date.now() - startTime,
    });
    return brand;
  } catch (error) {
    logger.error('updateBrandBySlug failed', {
      slug,
      data,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function deleteBrandBySlug(slug: string) {
  const startTime = Date.now();
  try {
    await prisma.brand.delete({
      where: { slug },
    });
    logger.info('deleteBrandBySlug success', { slug, duration: Date.now() - startTime });
    return { success: true };
  } catch (error) {
    logger.error('deleteBrandBySlug failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
