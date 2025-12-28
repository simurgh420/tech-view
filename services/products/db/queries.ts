// services/products/db/queries.ts
import prisma from '@/services/db/client';

export async function getProducts() {
  return prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      subCategory: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
      prices: true,
    },
  });
}

export async function getProductsByBrand(slug: string) {
  return prisma.product.findMany({
    where: { brand: { slug } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProductsByCategory(slug: string) {
  return prisma.product.findMany({
    where: { category: { slug } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
  });
}
