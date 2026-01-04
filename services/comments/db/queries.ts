// services/comments/db/queries.ts
import prisma from '@/services/db/client';
import { CommentSafe } from '@/types/comment';

export async function getCommentsByPostId(postId: string): Promise<CommentSafe[]> {
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'desc' },
    include: {
      author: true,
    },
  });

  return comments.map(c => ({
    id: c.id,
    content: c.content,
    rating: c.rating,
    createdAt: c.createdAt,
    authorName: c.author?.name ?? null,
    authorImage: c.author?.image ?? null,
  }));
}

export async function getAllCommentsWithPost() {
  return prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: true,
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
