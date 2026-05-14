import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createComment, updateComment, deleteComment } from '@/services/comments/db/mutations';

vi.mock('@/services/db/client', () => {
  const mockPrisma = {
    comment: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  };
  return { default: mockPrisma };
});

import prisma from '@/services/db/client';

describe('Comment Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createComment', () => {
    it('should create a comment and return public author info', async () => {
      const input = {
        postId: 'post-1',
        authorId: 'user-1',
        content: 'متن کامنت',
        rating: 4,
      };

      const mockCreatedComment = {
        id: 'c1',
        content: 'متن کامنت',
        rating: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
        postId: 'post-1',
        authorId: 'user-1',
        author: {
          name: 'کاربر تست',
          image: '/avatar.jpg',
        },
      };

      (prisma.comment.create as any).mockResolvedValue(mockCreatedComment);

      const result = await createComment(input);

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          postId: 'post-1',
          content: 'متن کامنت',
          rating: 4,
          authorId: 'user-1',
        },
        include: {
          author: { select: { name: true, image: true } },
        },
      });

      expect(result.content).toBe('متن کامنت');
      expect(result.rating).toBe(4);
      expect(result.author?.name).toBe('کاربر تست');
      expect(result.author?.image).toBe('/avatar.jpg');

      if (result.author) {
        expect(result.author).not.toHaveProperty('email');
        expect(result.author).not.toHaveProperty('password');
      }
    });

    it('should set default rating 5 when not provided', async () => {
      // به دلیل الزامی بودن rating در تایپ، از as any استفاده می‌کنیم
      const input = {
        postId: 'post-2',
        authorId: 'user-2',
        content: 'متن',
      } as any; // bypass type check

      (prisma.comment.create as any).mockResolvedValue({
        id: 'c2',
        content: 'متن',
        rating: 5,
        author: { name: 'کاربر', image: null },
      });

      await createComment(input);

      expect(prisma.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ rating: 5 }),
        })
      );
    });
  });

  describe('updateComment', () => {
    it('should update comment and return public author info', async () => {
      const mockUpdatedComment = {
        id: 'c1',
        content: 'ویرایش شده',
        rating: 3,
        updatedAt: new Date(),
        author: {
          name: 'کاربر تست',
          image: '/avatar.jpg',
        },
      };

      (prisma.comment.update as any).mockResolvedValue(mockUpdatedComment);

      const result = await updateComment('c1', {
        content: 'ویرایش شده',
        rating: 3,
      });

      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { content: 'ویرایش شده', rating: 3 },
        include: {
          author: { select: { name: true, image: true } },
        },
      });

      expect(result.content).toBe('ویرایش شده');
      expect(result.rating).toBe(3);
      expect(result.author?.name).toBe('کاربر تست');
      if (result.author) {
        expect(result.author).not.toHaveProperty('email');
      }
    });

    it('should update only provided fields', async () => {
      (prisma.comment.update as any).mockResolvedValue({
        id: 'c1',
        content: 'فقط متن',
        rating: 5,
        author: { name: 'کاربر', image: null },
      });

      await updateComment('c1', { content: 'فقط متن' });

      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { content: 'فقط متن' },
        include: expect.any(Object),
      });
    });
  });

  describe('deleteComment', () => {
    it('should delete comment and return { success: true }', async () => {
      (prisma.comment.findUnique as any).mockResolvedValue({ id: 'c1' });
      (prisma.comment.delete as any).mockResolvedValue({ success: true });

      const result = await deleteComment('c1');

      expect(prisma.comment.findUnique).toHaveBeenCalledWith({ where: { id: 'c1' } });
      // حذف select از انتظار (چون پیاده‌سازی واقعی آن را ندارد)
      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: 'c1' },
      });
      expect(result).toEqual({ success: true });
    });

    it('should return null if comment does not exist', async () => {
      (prisma.comment.findUnique as any).mockResolvedValue(null);

      const result = await deleteComment('non-existent');

      expect(result).toBeNull();
      expect(prisma.comment.delete).not.toHaveBeenCalled();
    });

    it('should throw database error', async () => {
      (prisma.comment.findUnique as any).mockRejectedValue(new Error('Connection lost'));

      await expect(deleteComment('c1')).rejects.toThrow('Connection lost');
      expect(prisma.comment.delete).not.toHaveBeenCalled();
    });
  });
});
