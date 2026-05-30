import prisma from '@/services/db/client';
import { CommentSafe } from '@/types/comment';
import { logger } from '@/lib/logger';

export async function getCommentsByPostId(postId: string): Promise<CommentSafe[]> {
  const startTime = Date.now();
  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true, image: true } },
      },
    });
    const result: CommentSafe[] = comments.map(c => ({
      id: c.id,
      content: c.content,
      rating: c.rating,
      createdAt: c.createdAt,
      authorName: c.author?.name ?? null,
      authorImage: c.author?.image ?? null,
    }));
    logger.info('getCommentsByPostId success', {
      postId,
      count: result.length,
      duration: Date.now() - startTime,
    });
    return result;
  } catch (error) {
    logger.error('getCommentsByPostId failed', {
      postId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getAllCommentsWithPost() {
  const startTime = Date.now();
  try {
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true, image: true } },
        post: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });
    logger.info('getAllCommentsWithPost success', {
      count: comments.length,
      duration: Date.now() - startTime,
    });
    return comments;
  } catch (error) {
    logger.error('getAllCommentsWithPost failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getCommentById(id: string) {
  const startTime = Date.now();
  try {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      logger.info('getCommentById: not found', { id, duration: Date.now() - startTime });
      return null;
    }
    logger.info('getCommentById success', { id, duration: Date.now() - startTime });
    return comment;
  } catch (error) {
    logger.error('getCommentById failed', {
      id,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
