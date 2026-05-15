// services/comments/db/mutations.ts
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

export async function createComment(data: {
  postId: string;
  authorId: string;
  content: string;
  rating: number;
}) {
  const startTime = Date.now();
  try {
    const comment = await prisma.comment.create({
      data: {
        postId: data.postId,
        content: data.content,
        rating: data.rating ?? 5,
        authorId: data.authorId,
      },
      include: {
        author: { select: { name: true, image: true } },
      },
    });
    logger.info('createComment success', {
      commentId: comment.id,
      postId: data.postId,
      authorId: data.authorId,
      duration: Date.now() - startTime,
    });
    return comment;
  } catch (error) {
    logger.error('createComment failed', {
      postId: data.postId,
      authorId: data.authorId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function updateComment(
  commentId: string,
  data: {
    content?: string;
    rating?: number;
  }
) {
  const startTime = Date.now();
  try {
    const existing = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!existing) {
      logger.info('updateComment: comment not found', {
        commentId,
        duration: Date.now() - startTime,
      });
      return null;
    }
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data,
      include: {
        author: { select: { name: true, image: true } },
      },
    });
    logger.info('updateComment success', {
      commentId,
      updatedFields: Object.keys(data),
      duration: Date.now() - startTime,
    });
    return comment;
  } catch (error) {
    logger.error('updateComment failed', {
      commentId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function deleteComment(commentId: string) {
  const startTime = Date.now();
  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      logger.info('deleteComment: comment not found', {
        commentId,
        duration: Date.now() - startTime,
      });
      return null;
    }
    await prisma.comment.delete({
      where: { id: commentId },
    });
    logger.info('deleteComment success', { commentId, duration: Date.now() - startTime });
    return { success: true };
  } catch (error) {
    logger.error('deleteComment failed', {
      commentId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
