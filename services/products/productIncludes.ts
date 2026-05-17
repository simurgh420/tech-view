export const productIncludes = {
  brand: true,
  category: true,
  subCategory: true,
  specifications: true,
} as const;

export const productWithReviews = {
  ...productIncludes,
  reviews: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  },
};
