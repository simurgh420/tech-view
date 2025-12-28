// services/reviews/db/queries.ts

import prisma from '@/services/db/client';

// 📌 گرفتن نظرات یک محصول

export async function getReviewsByProductSlug(slug: string) {
  return prisma.review.findMany({
    where: { product: { slug } },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
}
