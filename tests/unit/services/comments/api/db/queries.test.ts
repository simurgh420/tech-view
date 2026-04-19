import { describe, it, expect, vi } from 'vitest';
import prisma from '@/services/db/client';
import { getCommentsByPostId, getAllCommentsWithPost } from '@/services/comments/db/queries';

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
        createdAt: new Date(),
        author: {
          name: 'reza',
          image: 'avatar.png',
        },
      },
    ];

     
    (prisma.comment.findMany as any).mockResolvedValueOnce(fakeResponse);

    const result = await getCommentsByPostId('fake-post-id');

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: { postId: 'fake-post-id' },
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
      },
    });

    expect(result).toEqual([
      {
        id: '1',
        content: 'کامنت تستی',
        rating: 5,
        createdAt: fakeResponse[0].createdAt,
        authorName: 'reza',
        authorImage: 'avatar.png',
      },
    ]);
  });

  it('should fetch all comments with post info', async () => {
    const fakeResponse = [
      {
        id: '1',
        content: 'کامنت تستی',
        rating: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          name: 'reza',
          image: 'avatar.png',
        },
        post: { id: 'p1', slug: 'test-post', title: 'Test Post' },
      },
    ];

     
    (prisma.comment.findMany as any).mockResolvedValueOnce(fakeResponse);

    const result = await getAllCommentsWithPost();

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
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

    expect(result).toEqual(fakeResponse);
  });
});
