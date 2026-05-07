// services/products/db/queries.ts
import prisma from '@/services/db/client';
import { productIncludes, productWithReviews } from '../productIncludes';

export async function getProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: productIncludes,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: productWithReviews,
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
    include: productIncludes,
  });
}

export async function getFilteredProducts(filters: {
  brandSlug?: string;
  categorySlug?: string;
  subCategorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'new';
  q?: string;
  page?: number;
  perPage?: number;
}) {
  const { brandSlug, categorySlug, subCategorySlug, minPrice, maxPrice, sort, q, page, perPage } =
    filters;

  const where: any = { status: 'PUBLISHED' };

  if (brandSlug) where.brand = { slug: { equals: brandSlug, mode: 'insensitive' } };
  if (categorySlug) where.category = { slug: categorySlug };
  if (subCategorySlug) where.subCategory = { slug: subCategorySlug };
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  let orderBy: any;
  switch (sort) {
    case 'price-asc':
      orderBy = { price: 'asc' };
      break;
    case 'price-desc':
      orderBy = { price: 'desc' };
      break;
    case 'featured':
      orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  const skip = page && perPage ? (page - 1) * perPage : undefined;
  const take = perPage;

  return prisma.product.findMany({
    where,
    orderBy,
    skip,
    take,
    include: productIncludes,
  });
}
