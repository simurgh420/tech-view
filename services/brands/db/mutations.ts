// services/brands/db/mutations.ts
import prisma from '@/services/db/client';

import { toSlug } from '@/lib/slug';
import { BrandPayload } from '@/types/brand';

export async function createBrand(data: BrandPayload) {
  return prisma.brand.create({
    data: {
      name: data.name,
      slug: toSlug(data.name),
      logo: data.logo || null,
      isActive: true,
    },
  });
}

export async function updateBrandBySlug(slug: string, data: Partial<BrandPayload>) {
  return prisma.brand.update({
    where: { slug },
    data,
  });
}

export async function deleteBrandBySlug(slug: string) {
  await prisma.brand.delete({
    where: { slug },
  });
  return { success: true };
}
