import prisma from '@/services/db/client';
import { generateUniqueSlug, toSlug } from '@/lib/slug';
import { logger } from '@/lib/logger';
import type { CreateBrandInput, UpdateBrandInput } from '@/lib/validation/brand';

// ---------- ایجاد برند ----------
export async function createBrand(data: CreateBrandInput) {
  const startTime = Date.now();
  const baseSlug = toSlug(data.name);
  const uniqueSlug = await generateUniqueSlug(baseSlug);

  try {
    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug: uniqueSlug,
        logo: data.logo ?? null,
        isActive: data.isActive ?? true,
      },
    });
    logger.info('createBrand success', {
      brandId: brand.id,
      name: brand.name,
      slug: uniqueSlug,
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

// ---------- ویرایش برند ----------
export async function updateBrandBySlug(slug: string, data: UpdateBrandInput) {
  const startTime = Date.now();
  try {
    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (!existing) {
      logger.info('updateBrandBySlug: brand not found', { slug, duration: Date.now() - startTime });
      return null;
    }

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
      // اگر نام تغییر کرده، اسلاگ جدید یکتا بساز
      const newBaseSlug = toSlug(data.name);
      updateData.slug = await generateUniqueSlug(newBaseSlug, existing.id);
    }
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const brand = await prisma.brand.update({
      where: { slug },
      data: updateData,
    });

    logger.info('updateBrandBySlug success', {
      oldSlug: slug,
      newName: data.name,
      newSlug: updateData.slug as string | undefined,
      duration: Date.now() - startTime,
    });
    return brand;
  } catch (error) {
    logger.error('updateBrandBySlug failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

// ---------- حذف برند ----------
export async function deleteBrandBySlug(slug: string) {
  const startTime = Date.now();
  try {
    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (!existing) {
      logger.info('deleteBrandBySlug: brand not found', { slug, duration: Date.now() - startTime });
      return null;
    }

    await prisma.brand.delete({ where: { slug } });
    logger.info('deleteBrandBySlug success', { slug, duration: Date.now() - startTime });
    return true;
  } catch (error) {
    logger.error('deleteBrandBySlug failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
