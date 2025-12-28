// services/brands/db/queries.ts

import prisma from '@/services/db/client';

// 📌 گرفتن لیست برندها
export async function getBrands() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

// 📌 گرفتن یک برند با slug

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          discountPrice: true,
          thumbnail: true,
          rating: true,
          reviewCount: true,
        },
      },
    },
  });
}
