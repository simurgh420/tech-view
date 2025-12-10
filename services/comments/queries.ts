import prisma from '../db/client';

export type CommentSafe = {
  id: string;
  content: string;
  rating: number;
  avatar?: string | null;
  author: string;
  likes: number;
  dislikes: number;
  createdAt: Date;
};

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
export async function createComment(
  postId: string,
  author: string,
  content: string,
  avatar?: string,
  rating: number = 5
) {
  return prisma.comment.create({
    data: { postId, author, content, avatar, rating },
    select: {
      id: true,
      content: true,
      author: true,
      avatar: true,
      rating: true,
      createdAt: true,
    },
  });
}
export async function likeComment(commentId: string) {
  return prisma.comment.update({
    where: { id: commentId },
    data: { likes: { increment: 1 } },
  });
}
export async function dislikeComment(commentId: string) {
  return prisma.comment.update({
    where: { id: commentId },
    data: { dislikes: { increment: 1 } },
  });
}
