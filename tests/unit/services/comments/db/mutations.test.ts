import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createComment, updateComment, deleteComment } from '@/services/comments/db/mutations';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => ({
  default: {
    comment: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Comment DB Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createComment', () => {
    const input = {
      postId: 'post-1',
      authorId: 'user-1',
      content: 'Great post!',
      rating: 5,
    };
    const mockComment = { id: 'c1', ...input, author: { name: 'John', image: 'john.jpg' } };

    it('should create comment successfully', async () => {
      (prisma.comment.create as any).mockResolvedValue(mockComment);
      const result = await createComment(input);
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          postId: 'post-1',
          content: 'Great post!',
          rating: 5,
          authorId: 'user-1',
        },
        include: { author: { select: { name: true, image: true } } },
      });
      expect(result).toEqual(mockComment);
      expect(logger.info).toHaveBeenCalledWith(
        'createComment success',
        expect.objectContaining({ commentId: 'c1', postId: 'post-1' })
      );
    });

    it('should log error and rethrow on failure', async () => {
      const dbError = new Error('DB error');
      (prisma.comment.create as any).mockRejectedValue(dbError);
      await expect(createComment(input)).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateComment', () => {
    const commentId = 'c1';
    const data = { content: 'Updated content', rating: 4 };
    const existingComment = { id: commentId, content: 'Old', rating: 5 };
    const updatedComment = {
      ...existingComment,
      ...data,
      author: { name: 'John', image: 'john.jpg' },
    };

    it('should return null if comment not found', async () => {
      (prisma.comment.findUnique as any).mockResolvedValue(null);
      const result = await updateComment(commentId, data);
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'updateComment: comment not found',
        expect.any(Object)
      );
    });

    it('should update comment successfully', async () => {
      (prisma.comment.findUnique as any).mockResolvedValue(existingComment);
      (prisma.comment.update as any).mockResolvedValue(updatedComment);
      const result = await updateComment(commentId, data);
      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: commentId },
        data,
        include: { author: { select: { name: true, image: true } } },
      });
      expect(result).toEqual(updatedComment);
      expect(logger.info).toHaveBeenCalledWith(
        'updateComment success',
        expect.objectContaining({ commentId, updatedFields: ['content', 'rating'] })
      );
    });

    it('should log error on failure', async () => {
      (prisma.comment.findUnique as any).mockResolvedValue(existingComment);
      (prisma.comment.update as any).mockRejectedValue(new Error('Update failed'));
      await expect(updateComment(commentId, data)).rejects.toThrow('Update failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteComment', () => {
    const commentId = 'c1';
    const existingComment = { id: commentId, content: 'Test' };

    it('should return null if comment not found', async () => {
      (prisma.comment.findUnique as any).mockResolvedValue(null);
      const result = await deleteComment(commentId);
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'deleteComment: comment not found',
        expect.any(Object)
      );
    });

    it('should delete comment and return success true', async () => {
      (prisma.comment.findUnique as any).mockResolvedValue(existingComment);
      (prisma.comment.delete as any).mockResolvedValue({});
      const result = await deleteComment(commentId);
      expect(result).toEqual({ success: true });
      expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { id: commentId } });
      expect(logger.info).toHaveBeenCalledWith(
        'deleteComment success',
        expect.objectContaining({ commentId })
      );
    });

    it('should log error on failure', async () => {
      (prisma.comment.findUnique as any).mockResolvedValue(existingComment);
      (prisma.comment.delete as any).mockRejectedValue(new Error('Delete failed'));
      await expect(deleteComment(commentId)).rejects.toThrow('Delete failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
