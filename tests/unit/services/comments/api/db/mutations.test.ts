// services/comments/__tests__/mutations.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createComment, updateComment, deleteComment } from '@/services/comments/db/mutations';

// Mock کردن ماژول prisma
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

// برای دسترسی در تست‌ها import می‌کنیم
import prisma from '@/services/db/client';

describe('Comment Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createComment', () => {
    it('باید کامنت را ایجاد کند و اطلاعات عمومی نویسنده را برگرداند', async () => {
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

      // بررسی فراخوانی prisma
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

      // بررسی خروجی (توجه به optional chaining برای author)
      expect(result.content).toBe('متن کامنت');
      expect(result.rating).toBe(4);
      expect(result.author?.name).toBe('کاربر تست');
      expect(result.author?.image).toBe('/avatar.jpg');

      // اطمینان از عدم وجود فیلدهای حساس
      if (result.author) {
        expect(result.author).not.toHaveProperty('email');
        expect(result.author).not.toHaveProperty('password');
      }
    });

    it('در صورت عدم ارسال rating، باید مقدار پیش‌فرض ۵ قرار دهد', async () => {
      const input = {
        postId: 'post-2',
        authorId: 'user-2',
        content: 'متن',
        rating: 0, // فرض می‌کنیم 0 به معنای ارسال نشده است
      };

      (prisma.comment.create as any).mockResolvedValue({
        id: 'c2',
        content: 'متن',
        rating: 5, // پیش‌فرض
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
    it('باید کامنت را به‌روز کند و اطلاعات عمومی نویسنده را برگرداند', async () => {
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

      // بررسی فراخوانی prisma
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
      // عدم وجود ایمیل
      if (result.author) {
        expect(result.author).not.toHaveProperty('email');
      }
    });

    it('باید فقط فیلدهای ارسالی را به‌روز کند', async () => {
      (prisma.comment.update as any).mockResolvedValue({
        id: 'c1',
        content: 'فقط متن',
        rating: 5,
        author: { name: 'کاربر', image: null },
      });

      await updateComment('c1', { content: 'فقط متن' });

      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { content: 'فقط متن' }, // rating ارسال نشده
        include: expect.any(Object),
      });
    });
  });

  describe('deleteComment', () => {
    it('باید کامنت را حذف کند و { success: true } برگرداند', async () => {
      // mock findUnique (وجود کامنت)
      (prisma.comment.findUnique as any).mockResolvedValue({ id: 'c1' });
      (prisma.comment.delete as any).mockResolvedValue({ id: 'c1' });

      const result = await deleteComment('c1');

      // باید ابتدا وجود کامنت را چک کرده باشد
      expect(prisma.comment.findUnique).toHaveBeenCalledWith({ where: { id: 'c1' } });
      // سپس حذف انجام شده باشد
      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: 'c1' },
        select: { id: true },
      });

      // خروجی موفقیت
      expect(result).toEqual({ success: true });
    });

    it('اگر کامنت وجود نداشت باید null برگرداند', async () => {
      (prisma.comment.findUnique as any).mockResolvedValue(null);

      const result = await deleteComment('non-existent');

      expect(result).toBeNull();
      // نباید عملیات حذف صدا زده شود
      expect(prisma.comment.delete).not.toHaveBeenCalled();
    });

    it('باید خطای دیتابیس را به بالا پرتاب کند', async () => {
      (prisma.comment.findUnique as any).mockRejectedValue(new Error('Connection lost'));

      await expect(deleteComment('c1')).rejects.toThrow('Connection lost');
      // باز هم delete نباید صدا زده شده باشد
      expect(prisma.comment.delete).not.toHaveBeenCalled();
    });
  });
});
