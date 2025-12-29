import prisma from '@/services/db/client';

export async function createComment(data: {
  postId: string;
  author: string;
  content: string;
  avatar?: string;
  rating: number;
}) {
  return prisma.comment.create({
    data: {
      postId: data.postId,
      content: data.content,
      rating: data.rating ?? 5,
      avatar: data.avatar ?? null,
      author: data.author,
    },
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
// ویرایش کامنت
export async function updateComment(
  commentId: string,
  data: {
    content?: string;
    rating?: number;
    avatar?: string;
  }
) {
  return prisma.comment.update({
    where: { id: commentId },
    data,
    select: {
      id: true,
      content: true,
      author: true,
      avatar: true,
      rating: true,
      likes: true,
      dislikes: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
// حذف کامنت
export async function deleteComment(commentId: string) {
  return prisma.comment.delete({
    where: { id: commentId },
    select: { id: true },
  });
}
export async function likeComment(commentId: string) {
  return prisma.comment.update({
    where: { id: commentId },
    data: { likes: { increment: 1 } },
    select: { id: true, likes: true },
  });
}
export async function unlikeComment(commentId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { likes: true },
  });
  if (!comment || comment.likes <= 0) {
    return { id: commentId, likes: 0 };
  }
  return prisma.comment.update({
    where: { id: commentId },
    data: { likes: { decrement: 1 } },
    select: { id: true, likes: true },
  });
}
export async function dislikeComment(commentId: string) {
  return prisma.comment.update({
    where: { id: commentId },
    data: { dislikes: { increment: 1 } },
    select: { id: true, dislikes: true },
  });
}

export async function undislikeComment(commentId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { dislikes: true },
  });
  if (!comment || comment.dislikes <= 0) {
    return { id: commentId, dislikes: 0 };
  }
  return prisma.comment.update({
    where: { id: commentId },
    data: { dislikes: { decrement: 1 } },
    select: { id: true, dislikes: true },
  });
}
