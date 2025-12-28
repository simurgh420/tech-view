// services/categories/db/queries.ts

import prisma from '@/services/db/client';

// 📌 گرفتن لیست دسته‌بندی‌ها (برای منو، فیلتر، هوم‌پیج)

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
}

// 📌 گرفتن یک دسته‌بندی با slug + محصولاتش

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
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
