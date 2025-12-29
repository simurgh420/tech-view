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
