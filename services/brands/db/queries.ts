// services/brands/db/queries.ts
import prisma from '@/services/db/client';

export async function getBrands() {
  return prisma.brand.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getActiveBrands() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}
