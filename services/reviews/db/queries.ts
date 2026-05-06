// services/reviews/db/queries.ts

import prisma from '@/services/db/client';
import { userSelect } from '../userSelect';

export async function getReviewsByProductSlug(slug: string) {
  return prisma.review.findMany({
    where: { product: { slug } },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: userSelect } },
  });
}
// برای داشبورد
export async function getReviewById(id: string) {
  return prisma.review.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });
}
//---------------// برای داشبورد  // --------------------------------------

export async function getAllReviewsAdmin() {
  return prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, image: true } },
      product: { select: { id: true, slug: true, title: true } },
    },
  });
}
export async function getReviewByIdAdmin(id: string) {
  return prisma.review.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, image: true } },
      product: { select: { id: true, slug: true, title: true } },
    },
  });
}
