import { Prisma } from '@/app/generated/prisma/client';

export const productIncludes = {
  brand: true,
  category: true,
  subCategory: true,
  specifications: true,
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
