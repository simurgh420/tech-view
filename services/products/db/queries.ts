// services/products/db/queries.ts
import prisma from '@/services/db/client';
import { Product } from '@/types/product';

export async function getProducts() {
  return prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
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
  if (!product) return null;
  return {
    ...product,
    price: product.price.toString(),
    discountPrice: product.discountPrice ? product.discountPrice.toString() : null,
    rating: product.rating ? product.rating.toString() : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    publishedAt: product.publishedAt ? product.publishedAt.toISOString() : null,
  };
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
