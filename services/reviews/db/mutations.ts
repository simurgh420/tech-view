// services/reviews/db/mutations.ts
import prisma from '@/services/db/client';
import { userSelect } from '../userSelect';
import { logger } from '@/lib/logger';

export async function createReview(data: {
  productSlug: string;
  authorId: string;
  rating: number;
  title?: string;
  content: string;
}) {
  const startTime = Date.now();
  try {
    // پیدا کردن product بر اساس slug
    const product = await prisma.product.findUnique({
      where: { slug: data.productSlug },
      select: { id: true },
    });
    if (!product) {
      throw new Error('Product not found');
    }

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        authorId: data.authorId,
        rating: data.rating,
        title: data.title ?? null,
        content: data.content,
      },
      include: {
        user: { select: userSelect },
      },
    });
    logger.info('createReview success', {
      reviewId: review.id,
      productSlug: data.productSlug,
      authorId: data.authorId,
      duration: Date.now() - startTime,
    });
    return review;
  } catch (error) {
    logger.error('createReview failed', {
      productSlug: data.productSlug,
      authorId: data.authorId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function updateReview(
  id: string,
  data: Partial<{ rating: number; title: string; content: string }>
) {
  const startTime = Date.now();
  try {
    const review = await prisma.review.update({
      where: { id },
      data,
      include: { user: { select: userSelect } },
    });
    logger.info('updateReview success', {
      reviewId: id,
      updatedFields: Object.keys(data),
      duration: Date.now() - startTime,
    });
    return review;
  } catch (error) {
    logger.error('updateReview failed', {
      reviewId: id,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function deleteReview(id: string) {
  const startTime = Date.now();
  try {
    await prisma.review.delete({ where: { id } });
    logger.info('deleteReview success', {
      reviewId: id,
      duration: Date.now() - startTime,
    });
    return { success: true };
  } catch (error) {
    logger.error('deleteReview failed', {
      reviewId: id,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
