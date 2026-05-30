// services/reviews/db/queries.ts
import prisma from '@/services/db/client';
import { userSelect } from '../userSelect';
import { logger } from '@/lib/logger';

// دریافت نظرات یک محصول بر اساس slug محصول
export async function getReviewsByProductSlug(slug: string) {
  const startTime = Date.now();
  try {
    const reviews = await prisma.review.findMany({
      where: { product: { slug } },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: userSelect } }, // در صورت نیاز به author تغییر دهید
    });
    logger.info('getReviewsByProductSlug success', {
      slug,
      count: reviews.length,
      duration: Date.now() - startTime,
    });
    return reviews;
  } catch (error) {
    logger.error('getReviewsByProductSlug failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

// دریافت نظرات یک محصول بر اساس productId (برای هماهنگی با API)
export async function getReviewsByProductId(productId: string) {
  const startTime = Date.now();
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: userSelect } },
    });
    logger.info('getReviewsByProductId success', {
      productId,
      count: reviews.length,
      duration: Date.now() - startTime,
    });
    return reviews;
  } catch (error) {
    logger.error('getReviewsByProductId failed', {
      productId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

// دریافت یک نظر به همراه authorId (برای بررسی دسترسی)
export async function getReviewById(id: string) {
  const startTime = Date.now();
  try {
    const review = await prisma.review.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });
    if (!review) {
      logger.info('getReviewById: not found', { id, duration: Date.now() - startTime });
      return null;
    }
    logger.info('getReviewById success', { id, duration: Date.now() - startTime });
    return review;
  } catch (error) {
    logger.error('getReviewById failed', {
      id,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

// ------------------- توابع مخصوص داشبورد (ادمین) -------------------
export async function getAllReviewsAdmin() {
  const startTime = Date.now();
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, image: true } },
        product: { select: { id: true, slug: true, title: true } },
      },
    });
    logger.info('getAllReviewsAdmin success', {
      count: reviews.length,
      duration: Date.now() - startTime,
    });
    return reviews;
  } catch (error) {
    logger.error('getAllReviewsAdmin failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getReviewByIdAdmin(id: string) {
  const startTime = Date.now();
  try {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, image: true } },
        product: { select: { id: true, slug: true, title: true } },
      },
    });
    if (!review) {
      logger.info('getReviewByIdAdmin: not found', { id, duration: Date.now() - startTime });
      return null;
    }
    logger.info('getReviewByIdAdmin success', { id, duration: Date.now() - startTime });
    return review;
  } catch (error) {
    logger.error('getReviewByIdAdmin failed', {
      id,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
