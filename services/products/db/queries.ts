// services/products/db/queries.ts

import { Prisma } from '@/app/generated/prisma/client';
import prisma from '../../db/client';

// 📌 گرفتن لیست محصولات با فیلتر و pagination
export async function getProducts({
  page = 1,
  pageSize = 20,
  brand,
  category,
  subCategory,
  isDiscounted,
  isFeatured,
  isNew,
  inStock,
  sort,
}: {
  page?: number;
  pageSize?: number;
  brand?: string;
  category?: string;
  subCategory?: string;
  isDiscounted?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  inStock?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating_desc';
}) {
  const skip = (page - 1) * pageSize;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: 'PUBLISHED',
    brand: brand ? { slug: brand } : undefined,
    category: category ? { slug: category } : undefined,
    subCategory: subCategory ? { slug: subCategory } : undefined,
    isDiscounted,
    isFeatured,
    isNew,
    isInStock: inStock,
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price_asc'
      ? { price: Prisma.SortOrder.asc }
      : sort === 'price_desc'
        ? { price: Prisma.SortOrder.desc }
        : sort === 'newest'
          ? { publishedAt: Prisma.SortOrder.desc }
          : sort === 'rating_desc'
            ? { rating: Prisma.SortOrder.desc }
            : { createdAt: Prisma.SortOrder.desc };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        brand: { select: { name: true, slug: true } },
        category: { select: { title: true, slug: true, icon: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

// 📌 گرفتن یک محصول با slug
export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      reviews: true,
    },
  });
}
