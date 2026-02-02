// services/products/db/queries.ts
import prisma from '@/services/db/client';

export async function getProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      brand: true,
      category: true,
      subCategory: true,
      prices: true,
      reviews: true,
    },
  });
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
        include: { user: { select: { id: true, name: true } } },
      },
      prices: true,
    },
  });
}
export async function getProductsByBrand(slug: string) {
  return prisma.product.findMany({
    where: { brand: { slug } },
    orderBy: { createdAt: 'desc' },
    include: { brand: true },
  });
}
export async function getProductsByCategory(slug: string) {
  return prisma.product.findMany({
    where: { category: { slug } },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });
}
export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    include: { brand: true, category: true },
  });
}
