// services/productComments/constants.ts

import { Prisma } from '@/app/generated/prisma/client';

/**
 * User Select
 */
export const authorSelect = {
  id: true,
  name: true,
  image: true,
} satisfies Prisma.UserSelect;

/**
 * Product Select (Admin)
 */
export const productAdminSelect = {
  id: true,
  slug: true,
  title: true,
} satisfies Prisma.ProductSelect;

/**
 * Include برای اکثر Queryهای کامنت
 */
export const commentInclude = {
  author: {
    select: authorSelect,
  },
} satisfies Prisma.ProductCommentInclude;

/**
 * Include مخصوص پنل مدیریت
 */
export const commentAdminInclude = {
  author: {
    select: authorSelect,
  },
  product: {
    select: productAdminSelect,
  },
} satisfies Prisma.ProductCommentInclude;

/**
 * Error Messages
 */
export const ProductCommentErrors = {
  PRODUCT_NOT_FOUND: 'Product not found',
  PARENT_COMMENT_NOT_FOUND: 'Parent comment not found in this product',
  MAX_DEPTH_REACHED: 'MAX_DEPTH_REACHED',
} as const;
