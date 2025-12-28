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

export async function getReviewById(id: string) {
  return prisma.review.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      product: { select: { id: true, slug: true, title: true } },
    },
  });
}
export async function getReviewsByUser(userId: string) {
  return prisma.review.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { id: true, slug: true, title: true } } },
  });
}
