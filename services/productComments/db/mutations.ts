import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';
import { DELETED_COMMENT_PLACEHOLDER, MAX_COMMENT_DEPTH } from '@/lib/constants/comments';

import { commentInclude, ProductCommentErrors } from '../constants';

export async function createComment(data: {
  productSlug: string;
  authorId: string;
  content: string;
  parentId?: string;
}) {
  const startTime = Date.now();

  try {
    const product = await prisma.product.findUnique({
      where: { slug: data.productSlug },
      select: { id: true },
    });

    if (!product) {
      throw new Error(ProductCommentErrors.PRODUCT_NOT_FOUND);
    }

    let depth = 0;

    if (data.parentId) {
      const parent = await prisma.productComment.findUnique({
        where: { id: data.parentId },
        select: {
          productId: true,
          depth: true,
          deletedAt: true,
        },
      });

      if (!parent || parent.productId !== product.id) {
        throw new Error(ProductCommentErrors.PARENT_COMMENT_NOT_FOUND);
      }

      if (parent.depth >= MAX_COMMENT_DEPTH) {
        throw new Error(ProductCommentErrors.MAX_DEPTH_REACHED);
      }

      depth = parent.depth + 1;
    }

    const comment = await prisma.productComment.create({
      data: {
        productId: product.id,
        authorId: data.authorId,
        content: data.content,
        parentId: data.parentId ?? null,
        depth,
      },
      include: commentInclude,
    });

    logger.info('createComment success', {
      commentId: comment.id,
      productSlug: data.productSlug,
      authorId: data.authorId,
      parentId: data.parentId ?? null,
      depth,
      duration: Date.now() - startTime,
    });

    return comment;
  } catch (error) {
    logger.error('createComment failed', {
      productSlug: data.productSlug,
      authorId: data.authorId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

export async function updateComment(
  id: string,
  data: Partial<{
    content: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  }>
) {
  const startTime = Date.now();

  try {
    const comment = await prisma.productComment.update({
      where: { id },
      data,
      include: commentInclude,
    });

    logger.info('updateComment success', {
      commentId: id,
      updatedFields: Object.keys(data),
      duration: Date.now() - startTime,
    });

    return comment;
  } catch (error) {
    logger.error('updateComment failed', {
      commentId: id,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

export async function deleteComment(id: string) {
  const startTime = Date.now();

  try {
    const hasReplies = await prisma.productComment.findFirst({
      where: { parentId: id },
      select: { id: true },
    });

    if (hasReplies) {
      await prisma.productComment.update({
        where: { id },
        data: {
          content: DELETED_COMMENT_PLACEHOLDER,
          authorId: null,
          deletedAt: new Date(),
        },
      });

      logger.info('deleteComment success (soft-delete)', {
        commentId: id,
        duration: Date.now() - startTime,
      });

      return {
        success: true,
        softDeleted: true,
      };
    }

    await prisma.productComment.delete({
      where: { id },
    });

    logger.info('deleteComment success (hard-delete)', {
      commentId: id,
      duration: Date.now() - startTime,
    });

    return {
      success: true,
      softDeleted: false,
    };
  } catch (error) {
    logger.error('deleteComment failed', {
      commentId: id,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}
