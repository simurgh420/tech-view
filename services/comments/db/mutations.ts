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
      author: { select: { name: true, image: true } },
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
      author: { select: { name: true, image: true } },
    },
  });
}

export async function deleteComment(commentId: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return null;
  await prisma.comment.delete({
    where: { id: commentId },
  });
  return { success: true };
}
