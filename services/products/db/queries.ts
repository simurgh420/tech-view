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

// ✅ فانکشن عمومی برای فیلتر و مرتب‌سازی
export async function getFilteredProducts({
  brandSlug,
  categorySlug,
  subCategorySlug,
  minPrice,
  maxPrice,
  sort = 'new',
  q,
  page,
  perPage,
  ram,
}: {
  brandSlug?: string;
  categorySlug?: string;
  subCategorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'new';
  q?: string;
  page?: number;
  perPage?: number;
  ram?: string[];
}) {
  let orderBy: any;

  if (sort === 'price-asc') orderBy = { price: 'asc' };
  else if (sort === 'price-desc') orderBy = { price: 'desc' };
  else if (sort === 'featured') orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
  else orderBy = { createdAt: 'desc' }; // new

  const skip = page && perPage ? (page - 1) * perPage : undefined;
  const take = perPage ?? undefined;

  const where: any = {
    status: 'PUBLISHED',
  };

  if (brandSlug) {
    where.brand = {
      slug: { equals: brandSlug, mode: 'insensitive' },
    };
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (subCategorySlug) {
    where.subCategory = { slug: subCategorySlug };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined && { gte: minPrice }),
      ...(maxPrice !== undefined && { lte: maxPrice }),
    };
  }

  if (ram && ram.length > 0) {
    where.ram = { in: ram };
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  return prisma.product.findMany({
    where,
    orderBy,
    skip,
    take,
    include: {
      brand: true,
      category: true,
      subCategory: true,
      reviews: true,
    },
  });
}
