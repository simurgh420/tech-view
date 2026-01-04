// services/comments/db/mutations.ts
import prisma from '@/services/db/client';

export async function createComment(data: {
  postId: string;
  authorId: string;
  content: string;
  rating: number;
}) {
  return prisma.comment.create({
    data: {
      postId: data.postId,
      content: data.content,
      rating: data.rating ?? 5,
      authorId: data.authorId,
    },
    include: {
      author: true,
    },
  });
}

export async function updateComment(
  commentId: string,
  data: {
    content?: string;
    rating?: number;
  }
) {
  return prisma.comment.update({
    where: { id: commentId },
    data,
    include: {
      author: true,
    },
  });
}

export async function deleteComment(commentId: string) {
  return prisma.comment.delete({
    where: { id: commentId },
    select: { id: true },
  });
}
