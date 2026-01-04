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
    data: {
      productId: data.productId,
      rating: data.rating,
      title: data.title,
      content: data.content,
      ...(data.authorId && { authorId: data.authorId }), // ← مهم
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
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
    include: { user: { select: { id: true, name: true } } },
  });
  return {
    ...review,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}
export async function deleteReview(id: string) {
  await prisma.review.delete({
    where: { id },
  });
  return { success: true };
}
