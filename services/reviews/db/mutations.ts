// services/reviews/db/mutations.ts

import prisma from '@/services/db/client';

export async function createReview(data: {
  productId: string;
  authorId?: string;
  rating: number;
  title?: string;
  content: string;
}) {
  return prisma.review.create({
    data,
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

export async function updateReview(
  id: string,
  data: Partial<{
    rating: number;
    title: string;
    content: string;
  }>
) {
  return prisma.review.update({
    where: { id },
    data,
    include: {
      user: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });
}

export async function deleteReview(id: string) {
  prisma.review.delete({
    where: { id },
  });
  return { success: true };
}
