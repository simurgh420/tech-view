// services/reviews/db/mutations.ts
import prisma from '@/services/db/client';
import { userSelect } from '../userSelect';
import { logger } from '@/lib/logger';
import { recalculateProductRating } from '../recalculateProductRating';

export async function createReview(data: {
  productSlug: string;
  authorId: string;
  rating: number;
  title?: string;
  content: string;
}) {
  const startTime = Date.now();
  try {
    const product = await prisma.product.findUnique({
      where: { slug: data.productSlug },
      select: { id: true },
    });
    if (!product) {
      throw new Error('Product not found');
    }

    const review = await prisma.$transaction(
      async tx => {
        const created = await tx.review.create({
          data: {
            productId: product.id,
            authorId: data.authorId,
            rating: data.rating,
            title: data.title ?? null,
            content: data.content,
          },
          include: { user: { select: userSelect } },
        });

        await recalculateProductRating(tx, product.id);

        return created;
      },
      { timeout: 15000 } // ✅
    );

    logger.info('createReview success', {
      reviewId: review.id,
      productSlug: data.productSlug,
      authorId: data.authorId,
      duration: Date.now() - startTime,
    });
    return review;
  } catch (error: any) {
    logger.error('createReview failed', {
      productSlug: data.productSlug,
      authorId: data.authorId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    if (error.code === 'P2002') {
      throw new Error('شما قبلاً برای این محصول نظر ثبت کرده‌اید');
    }
    throw error;
  }
}

export async function updateReview(
  id: string,
  data: Partial<{ rating: number; title: string; content: string }>
) {
  const startTime = Date.now();
  try {
    const review = await prisma.$transaction(
      async tx => {
        const updated = await tx.review.update({
          where: { id },
          data,
          include: { user: { select: userSelect } },
        });

        if (data.rating !== undefined) {
          await recalculateProductRating(tx, updated.productId);
        }

        return updated;
      },
      { timeout: 15000 } // ✅
    );

    logger.info('updateReview success', {
      reviewId: id,
      updatedFields: Object.keys(data),
      duration: Date.now() - startTime,
    });
    return review;
  } catch (error: any) {
    logger.error('updateReview failed', {
      reviewId: id,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    // ✅ اگه id نامعتبر باشه یا قبلاً حذف شده باشه
    if (error.code === 'P2025') {
      throw new Error('نظر مورد نظر پیدا نشد');
    }
    throw error;
  }
}

export async function deleteReview(id: string) {
  const startTime = Date.now();
  try {
    await prisma.$transaction(
      async tx => {
        const review = await tx.review.delete({ where: { id } });
        await recalculateProductRating(tx, review.productId);
      },
      { timeout: 15000 } // ✅
    );

    logger.info('deleteReview success', {
      reviewId: id,
      duration: Date.now() - startTime,
    });
    return { success: true };
  } catch (error: any) {
    logger.error('deleteReview failed', {
      reviewId: id,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    if (error.code === 'P2025') {
      throw new Error('نظر مورد نظر پیدا نشد');
    }
    throw error;
  }
}
