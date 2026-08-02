import { Prisma } from '@/app/generated/prisma/client';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';
import { MAX_COMMENT_DEPTH } from '@/lib/constants/comments';

import { commentInclude, commentAdminInclude } from '../constants';
import { CommentNode, ProductCommentWithAuthor } from '@/types/CommentProduct';

function buildCommentTree(flat: ProductCommentWithAuthor[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const item of flat) {
    map.set(item.id, {
      id: item.id,
      content: item.content,
      productId: item.productId,
      authorId: item.authorId,
      parentId: item.parentId,
      depth: item.depth,
      status: item.status,
      isDeleted: !!item.deletedAt,
      canReply: item.depth < MAX_COMMENT_DEPTH,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      author: item.deletedAt ? null : item.author,
      replies: [],
    });
  }

  for (const item of flat) {
    const node = map.get(item.id)!;

    if (item.parentId) {
      const parent = map.get(item.parentId);

      if (parent) {
        parent.replies.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function getCommentsByProductSlug(slug: string, includeUnapproved = false) {
  const startTime = Date.now();

  try {
    const where: Prisma.ProductCommentWhereInput = {
      product: {
        slug,
      },
    };

    if (!includeUnapproved) {
      where.status = 'APPROVED';
    }

    const flat = await prisma.productComment.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
      include: commentInclude,
    });

    const tree = buildCommentTree(flat);

    logger.info('getCommentsByProductSlug success', {
      slug,
      count: flat.length,
      duration: Date.now() - startTime,
    });

    return tree;
  } catch (error) {
    logger.error('getCommentsByProductSlug failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

export async function getCommentById(id: string) {
  const startTime = Date.now();

  try {
    const comment = await prisma.productComment.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        productId: true,
      },
    });

    if (!comment) {
      logger.info('getCommentById: not found', {
        id,
        duration: Date.now() - startTime,
      });

      return null;
    }

    logger.info('getCommentById success', {
      id,
      duration: Date.now() - startTime,
    });

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

export async function getAllCommentsAdmin() {
  const startTime = Date.now();

  try {
    const comments = await prisma.productComment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: commentAdminInclude,
    });

    logger.info('getAllCommentsAdmin success', {
      count: comments.length,
      duration: Date.now() - startTime,
    });

    return comments;
  } catch (error) {
    logger.error('getAllCommentsAdmin failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}
