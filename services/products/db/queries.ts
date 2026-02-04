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
  sort,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { createdAt: 'desc' };

  if (sort === 'price-asc') orderBy = { price: 'asc' };
  if (sort === 'price-desc') orderBy = { price: 'desc' };
  if (sort === 'new') orderBy = { createdAt: 'desc' };
  if (sort === 'featured') orderBy = { isFeatured: 'desc' };

  const skip = page && perPage ? (page - 1) * perPage : undefined;
  const take = perPage ?? undefined;
  console.log('DB where:', {
    ...(brandSlug && { brand: { slug: { equals: brandSlug, mode: 'insensitive' } } }),
    status: 'PUBLISHED',
  });
  return prisma.product.findMany({
    where: {
      ...(brandSlug && { brand: { slug: { equals: brandSlug, mode: 'insensitive' } } }),
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(subCategorySlug && { subCategory: { slug: subCategorySlug } }),
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { lte: maxPrice } }),
      ...(ram && { ram: { in: ram } }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }),
      status: 'PUBLISHED',
    },
    orderBy,
    skip,
    take,
    include: {
      brand: true,
      category: true,
      subCategory: true,
      prices: true,
      reviews: true,
    },
  });
}
