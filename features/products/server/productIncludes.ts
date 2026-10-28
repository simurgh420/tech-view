import { Prisma } from '@/app/generated/prisma/client';

export const productIncludes = {
  brand: true,
  category: true,
  subCategory: true,

  specifications: {
    include: {
      attribute: true,
    },
  },
} satisfies Prisma.ProductInclude;

export const productWithReviews = {
  ...productIncludes,

  reviews: {
    orderBy: {
      createdAt: 'desc',
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  },
} satisfies Prisma.ProductInclude;

export const homeProductSelect = {
  id: true,
  title: true,
  slug: true,

  price: true,
  discountPrice: true,
  discountPercentage: true,

  isDiscounted: true,
  rating: true,
  reviewCount: true,

  thumbnail: true,
} satisfies Prisma.ProductSelect;

export type HomeProduct = Prisma.ProductGetPayload<{
  select: typeof homeProductSelect;
}>;
