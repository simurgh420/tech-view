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
