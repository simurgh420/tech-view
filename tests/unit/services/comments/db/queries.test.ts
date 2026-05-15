import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCommentsByPostId,
  getAllCommentsWithPost,
  getCommentById,
} from '@/services/comments/db/queries';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => ({
  default: {
    comment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Comment DB Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCommentsByPostId', () => {
    const postId = 'post-123';
    const mockComments = [
      {
        id: 'c1',
        content: 'Great!',
        rating: 5,
        createdAt: new Date(),
        author: { name: 'John', image: 'john.jpg' },
      },
      {
        id: 'c2',
        content: 'Nice',
        rating: 4,
        createdAt: new Date(),
        author: { name: 'Jane', image: 'jane.jpg' },
      },
    ];
    const expectedTransformed = mockComments.map(c => ({
      id: c.id,
      content: c.content,
      rating: c.rating,
      createdAt: c.createdAt,
      authorName: c.author.name,
      authorImage: c.author.image,
    }));

    it('should fetch and transform comments by postId', async () => {
      (prisma.comment.findMany as any).mockResolvedValue(mockComments);
      const result = await getCommentsByPostId(postId);
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { postId },
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { name: true, image: true } },
        },
      });
      expect(result).toEqual(expectedTransformed);
      expect(logger.info).toHaveBeenCalledWith(
        'getCommentsByPostId success',
        expect.objectContaining({ postId, count: 2 })
      );
    });

    it('should handle empty comments', async () => {
      (prisma.comment.findMany as any).mockResolvedValue([]);
      const result = await getCommentsByPostId(postId);
      expect(result).toEqual([]);
      expect(logger.info).toHaveBeenCalledWith(
        'getCommentsByPostId success',
        expect.objectContaining({ count: 0 })
      );
    });

    it('should log error and throw on failure', async () => {
      const dbError = new Error('DB connection lost');
      (prisma.comment.findMany as any).mockRejectedValue(dbError);
      await expect(getCommentsByPostId(postId)).rejects.toThrow('DB connection lost');
      expect(logger.error).toHaveBeenCalledWith(
        'getCommentsByPostId failed',
        expect.objectContaining({ postId, error: 'DB connection lost' })
      );
    });
  });

  describe('getAllCommentsWithPost', () => {
    const mockComments = [
      {
        id: 'c1',
        content: 'Great',
        rating: 5,
        createdAt: new Date(),
        author: { name: 'John', image: 'john.jpg' },
        post: { id: 'p1', slug: 'post-1', title: 'Post 1' },
      },
    ];

    it('should fetch all comments with post details', async () => {
      (prisma.comment.findMany as any).mockResolvedValue(mockComments);
      const result = await getAllCommentsWithPost();
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { name: true, image: true } },
          post: { select: { id: true, slug: true, title: true } },
        },
      });
      expect(result).toEqual(mockComments);
      expect(logger.info).toHaveBeenCalledWith(
        'getAllCommentsWithPost success',
        expect.objectContaining({ count: 1 })
      );
    });

    it('should handle empty result', async () => {
      (prisma.comment.findMany as any).mockResolvedValue([]);
      const result = await getAllCommentsWithPost();
      expect(result).toEqual([]);
      expect(logger.info).toHaveBeenCalledWith(
        'getAllCommentsWithPost success',
        expect.objectContaining({ count: 0 })
      );
    });

    it('should log error and throw on failure', async () => {
      const dbError = new Error('Timeout');
      (prisma.comment.findMany as any).mockRejectedValue(dbError);
      await expect(getAllCommentsWithPost()).rejects.toThrow('Timeout');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getCommentById', () => {
    const id = 'comment-1';
    const mockComment = { id, content: 'Test', rating: 5, createdAt: new Date() };

    it('should return comment when found', async () => {
      (prisma.comment.findUnique as any).mockResolvedValue(mockComment);
      const result = await getCommentById(id);
      expect(prisma.comment.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(mockComment);
      expect(logger.info).toHaveBeenCalledWith(
        'getCommentById success',
        expect.objectContaining({ id })
      );
    });

    it('should return null when not found', async () => {
      (prisma.comment.findUnique as any).mockResolvedValue(null);
      const result = await getCommentById('missing');
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'getCommentById: not found',
        expect.objectContaining({ id: 'missing' })
      );
    });

    it('should log error and throw on failure', async () => {
      const dbError = new Error('DB error');
      (prisma.comment.findUnique as any).mockRejectedValue(dbError);
      await expect(getCommentById(id)).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalledWith(
        'getCommentById failed',
        expect.objectContaining({ id, error: 'DB error' })
      );
    });
  });
});
