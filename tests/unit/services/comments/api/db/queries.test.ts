import { describe, it, expect, vi } from 'vitest';
import prisma from '@/services/db/client';
import { getCommentsByPostId, getAllCommentsWithPost } from '@/services/comments/db/queries';

// Mock کردن Prisma Client
vi.mock('@/services/db/client', () => ({
  default: {
    comment: {
      findMany: vi.fn(),
    },
  },
}));

describe('Comment Queries (mocked)', () => {
  it('should fetch comments by postId', async () => {
    const fakeResponse = [
      {
        id: '1',
        content: 'کامنت تستی',
        rating: 5,
        avatar: 'avatar.png',
        author: 'reza',
        likes: 0,
        dislikes: 0,
        createdAt: new Date(),
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.comment.findMany as any).mockResolvedValueOnce(fakeResponse);

    const result = await getCommentsByPostId('fake-post-id');

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: { postId: 'fake-post-id' },
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
    expect(result).toEqual(fakeResponse);
  });

  it('should fetch all comments with post info', async () => {
    const fakeResponse = [
      {
        id: '1',
        content: 'کامنت تستی',
        rating: 5,
        avatar: 'avatar.png',
        author: 'reza',
        likes: 0,
        dislikes: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        post: { id: 'p1', slug: 'test-post', title: 'Test Post' },
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.comment.findMany as any).mockResolvedValueOnce(fakeResponse);

    const result = await getAllCommentsWithPost();

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
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
    expect(result).toEqual(fakeResponse);
  });
});
