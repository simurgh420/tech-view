// services/products/db/queries.ts
import prisma from '@/services/db/client';
import { homeProductSelect, productIncludes, productWithReviews } from '../productIncludes';
import { logger } from '@/lib/logger';
import { formatProduct } from '../utils/formatProduct';

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
    return products.map(formatProduct);
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
    return formatProduct(product);
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
      include: productIncludes,
    });
    logger.info('getProductsByBrand success', {
      slug,
      count: products.length,
      duration: Date.now() - startTime,
    });
    return products.map(formatProduct);
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
      include: productIncludes,
    });
    logger.info('getProductsByCategory success', {
      slug,
      count: products.length,
      duration: Date.now() - startTime,
    });
    return products.map(formatProduct);
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
    return products.map(formatProduct);
  } catch (error) {
    logger.error('getFeaturedProducts failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getAdminProducts() {
  const startTime = Date.now();
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        price: true,
        status: true,
        createdAt: true,
        category: { select: { title: true } },
        brand: { select: { name: true } },
      },
    });

    logger.info('getAdminProducts success', {
      count: products.length,
      duration: Date.now() - startTime,
    });

    return products;
  } catch (error) {
    logger.error('getAdminProducts failed', {
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

    // فیلتر مشخصات با استفاده از رابطه specifications (AND بین چند شرط)
    if (specs && Object.keys(specs).length > 0) {
      where.AND = [];
      for (const [key, value] of Object.entries(specs)) {
        where.AND.push({
          specifications: {
            some: {
              key: key,
              value: value,
            },
          },
        });
      }
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

    const take = perPage ?? 20;
    const currentPage = page ?? 1;
    const skip = (currentPage - 1) * take;

    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip, take, include: productIncludes }),
      prisma.product.count({ where }),
    ]);

    logger.info('getFilteredProducts success', {
      filterKeys: Object.keys(filters).filter(
        k => filters[k as keyof typeof filters] !== undefined
      ),
      count: items.length,
      total,
      page: currentPage,
      duration: Date.now() - startTime,
    });

    return {
      items: items.map(formatProduct),
      total,
      page: currentPage,
      perPage: take,
      pages: Math.ceil(total / take),
    };
  } catch (error) {
    logger.error('getFilteredProducts failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
export async function getBestSellerProducts(limit = 8) {
  const startTime = Date.now();

  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: {
        rating: 'desc',
      },
      take: limit,
      select: homeProductSelect,
    });

    logger.info('getBestSellerProducts success', {
      count: products.length,
      duration: Date.now() - startTime,
    });

    return products;
  } catch (error) {
    logger.error('getBestSellerProducts failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

export async function getNewArrivalProducts(limit = 10) {
  const startTime = Date.now();

  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: homeProductSelect,
    });

    logger.info('getNewArrivalProducts success', {
      count: products.length,
      duration: Date.now() - startTime,
    });

    return products;
  } catch (error) {
    logger.error('getNewArrivalProducts failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

export async function getDiscountedProducts(limit = 10) {
  const startTime = Date.now();

  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        isDiscounted: true,
        discountPrice: {
          not: null,
        },
      },
      orderBy: {
        discountPrice: 'asc',
      },
      take: limit,
      select: homeProductSelect,
    });

    logger.info('getDiscountedProducts success', {
      count: products.length,
      duration: Date.now() - startTime,
    });

    return products;
  } catch (error) {
    logger.error('getDiscountedProducts failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}
