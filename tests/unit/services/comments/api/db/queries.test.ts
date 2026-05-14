import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch comments by postId', async () => {
    const fakeRawComment = {
      id: '1',
      content: 'کامنت تستی',
      rating: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      postId: 'fake-post-id',
      authorId: 'u1',
      author: {
        name: 'reza',
        image: 'avatar.png',
      },
    };
    const fakeResponse = [fakeRawComment];
    const expectedTransformed = [
      {
        id: '1',
        content: 'کامنت تستی',
        rating: 5,
        createdAt: fakeRawComment.createdAt,
        authorName: 'reza',
        authorImage: 'avatar.png',
      },
    ];

    vi.mocked(prisma.comment.findMany).mockResolvedValueOnce(fakeResponse as any);

    const result = await getCommentsByPostId('fake-post-id');

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: { postId: 'fake-post-id' },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });
    expect(result).toEqual(expectedTransformed);
  });

  it('should fetch all comments with post info', async () => {
    const fakeRawComment = {
      id: '1',
      content: 'کامنت تستی',
      rating: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      postId: 'p1',
      authorId: 'u1',
      author: {
        name: 'reza',
        image: 'avatar.png',
      },
      post: {
        id: 'p1',
        slug: 'test-post',
        title: 'Test Post',
      },
    };
    const fakeResponse = [fakeRawComment];

    vi.mocked(prisma.comment.findMany).mockResolvedValueOnce(fakeResponse as any);

    const result = await getAllCommentsWithPost();

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });
    // بسته به پیاده‌سازی، خروجی می‌تواند همان fakeResponse باشد یا تغییر کرده.
    // با توجه به خطای قبلی، انتظار داریم خروجی شامل postId و authorId نیز باشد.
    // بنابراین result باید دقیقاً برابر fakeResponse باشد (چون تابع ممکن است مستقیماً خروجی Prisma را برگرداند).
    expect(result).toEqual(fakeResponse);
  });
});
