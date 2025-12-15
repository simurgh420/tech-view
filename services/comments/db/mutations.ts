import prisma from '../../db/client';

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
      likes: true,
      dislikes: true,
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
