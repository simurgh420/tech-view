// services/products/db/queries.ts
import prisma from '@/services/db/client';
import { productIncludes, productWithReviews } from '../productIncludes';
import { logger } from '@/lib/logger';

export async function getProducts() {
  const startTime = Date.now();
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: productIncludes,
    });
    logger.info('getProducts success', {
      count: products.length,
      duration: Date.now() - startTime,
    });
    return products;
  } catch (error) {
    logger.error('getProducts failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getProductBySlug(slug: string) {
  const startTime = Date.now();
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: productWithReviews,
    });
    if (!product) {
      logger.info('getProductBySlug: not found', { slug, duration: Date.now() - startTime });
      return null;
    }
    logger.info('getProductBySlug success', { slug, duration: Date.now() - startTime });
    return product;
  } catch (error) {
    logger.error('getProductBySlug failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getProductsByBrand(slug: string) {
  const startTime = Date.now();
  try {
    const products = await prisma.product.findMany({
      where: { brand: { slug } },
      orderBy: { createdAt: 'desc' },
      include: { brand: true },
    });
    logger.info('getProductsByBrand success', {
      slug,
      count: products.length,
      duration: Date.now() - startTime,
    });
    return products;
  } catch (error) {
    logger.error('getProductsByBrand failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getProductsByCategory(slug: string) {
  const startTime = Date.now();
  try {
    const products = await prisma.product.findMany({
      where: { category: { slug } },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    logger.info('getProductsByCategory success', {
      slug,
      count: products.length,
      duration: Date.now() - startTime,
    });
    return products;
  } catch (error) {
    logger.error('getProductsByCategory failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getFeaturedProducts() {
  const startTime = Date.now();
  try {
    const products = await prisma.product.findMany({
      where: { isFeatured: true, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      include: productIncludes,
    });
    logger.info('getFeaturedProducts success', {
      count: products.length,
      duration: Date.now() - startTime,
    });
    return products;
  } catch (error) {
    logger.error('getFeaturedProducts failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
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
  specs?: Record<string, string>;
}) {
  const startTime = Date.now();
  try {
    const {
      brandSlug,
      categorySlug,
      subCategorySlug,
      minPrice,
      maxPrice,
      sort,
      q,
      page,
      perPage,
      specs,
    } = filters;

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
    if (specs && Object.keys(specs).length > 0) {
      const specConditions = Object.entries(specs).map(([key, value]) => ({
        AND: [
          {
            specifications: {
              path: ['$[*].items[*].label'],
              array_contains: [key],
            },
          },
          {
            specifications: {
              path: ['$[*].items[*].value'],
              array_contains: [value],
            },
          },
        ],
      }));
      if (!where.AND) where.AND = [];
      where.AND.push(...specConditions);
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

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: productIncludes,
    });

    logger.info('getFilteredProducts success', {
      filterKeys: Object.keys(filters).filter(
        k => filters[k as keyof typeof filters] !== undefined
      ),
      count: products.length,
      duration: Date.now() - startTime,
    });
    return products;
  } catch (error) {
    logger.error('getFilteredProducts failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
