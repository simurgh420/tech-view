import { CommentSafe } from '@/types/comment';
import prisma from '../../db/client';

export async function getCommentsByPostId(postId: string): Promise<CommentSafe[]> {
  return prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      rating: true,
      avatar: true,
      author: true,
      likes: true,
      dislikes: true,
      createdAt: true,
    },
  });
}

export async function getAllCommentsWithPost() {
  return prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      rating: true,
      avatar: true,
      author: true,
      likes: true,
      dislikes: true,
      createdAt: true,
      updatedAt: true,
      post: {
        select: {
          id: true,
          slug: true,
          title: true,
        },
      },
    },
  });
}
