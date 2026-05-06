// services/reviews/db/mutations.ts

import prisma from '@/services/db/client';
import { userSelect } from '../userSelect';

export async function createReview(data: {
  productId: string;
  authorId: string;
  rating: number;
  title?: string;
  content: string;
}) {
  return prisma.review.create({
    data: {
      productId: data.productId,
      authorId: data.authorId,
      rating: data.rating,
      title: data.title ?? null,
      content: data.content,
    },

    include: {
      user: { select: userSelect },
    },
  });
}

export async function updateReview(
  id: string,
  data: Partial<{ rating: number; title: string; content: string }>
) {
  const review = await prisma.review.update({
    where: { id },
    data,
    include: { user: { select: userSelect } },
  });
  return {
    ...review,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}
export async function deleteReview(id: string) {
  await prisma.review.delete({ where: { id } });
  return { success: true };
}
