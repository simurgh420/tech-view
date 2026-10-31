// features/product-comments/server/mutations.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/prisma-adapter/client', () => ({
  default: {
    product: {
      findUnique: vi.fn(),
    },
    productComment: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import prisma from '@/features/prisma-adapter/client';
import { logger } from '@/lib/logger';
import {
  DELETED_COMMENT_PLACEHOLDER,
  MAX_COMMENT_DEPTH,
} from '@/features/product-comments/server/comments';
import { createComment, updateComment, deleteComment } from './mutations';
import { commentInclude, ProductCommentErrors } from './constants';

const product = prisma.product as any;
const comment = prisma.productComment as any;

const baseInput = {
  productSlug: 'iphone-15',
  authorId: 'user-1',
  content: 'محصول عالی است',
};

describe('product-comments/server/mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createComment', () => {
    describe('کامنت اصلی (بدون parent)', () => {
      beforeEach(() => {
        product.findUnique.mockResolvedValue({ id: 'p1' });
        comment.create.mockResolvedValue({ id: 'c1' });
      });

      it('should look up the product by slug (id only)', async () => {
        await createComment(baseInput);

        expect(product.findUnique).toHaveBeenCalledWith({
          where: { slug: 'iphone-15' },
          select: { id: true },
        });
      });

      it('should create a root comment with depth 0 and parentId null', async () => {
        await createComment(baseInput);

        expect(comment.findUnique).not.toHaveBeenCalled();
        expect(comment.create).toHaveBeenCalledWith({
          data: {
            productId: 'p1',
            authorId: 'user-1',
            content: 'محصول عالی است',
            parentId: null,
            depth: 0,
          },
          include: commentInclude,
        });
      });

      it('should return the created comment and log success', async () => {
        const created = { id: 'c1' };
        comment.create.mockResolvedValue(created);

        expect(await createComment(baseInput)).toEqual(created);
        expect(logger.info).toHaveBeenCalledWith(
          'createComment success',
          expect.objectContaining({
            commentId: 'c1',
            productSlug: 'iphone-15',
            authorId: 'user-1',
            parentId: null,
            depth: 0,
            duration: expect.any(Number),
          })
        );
      });
    });

    describe('پاسخ به کامنت (با parent)', () => {
      beforeEach(() => {
        product.findUnique.mockResolvedValue({ id: 'p1' });
        comment.create.mockResolvedValue({ id: 'c2' });
      });

      it('should select only the needed fields of the parent', async () => {
        comment.findUnique.mockResolvedValue({ productId: 'p1', depth: 0, deletedAt: null });

        await createComment({ ...baseInput, parentId: 'parent-1' });

        expect(comment.findUnique).toHaveBeenCalledWith({
          where: { id: 'parent-1' },
          select: { productId: true, depth: true, deletedAt: true },
        });
      });

      it('should set depth = parent.depth + 1', async () => {
        comment.findUnique.mockResolvedValue({ productId: 'p1', depth: 0, deletedAt: null });

        await createComment({ ...baseInput, parentId: 'parent-1' });

        expect(comment.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ parentId: 'parent-1', depth: 1 }),
          })
        );
      });

      it('should allow a reply when parent depth is exactly MAX_COMMENT_DEPTH - 1', async () => {
        comment.findUnique.mockResolvedValue({
          productId: 'p1',
          depth: MAX_COMMENT_DEPTH - 1,
          deletedAt: null,
        });

        await createComment({ ...baseInput, parentId: 'parent-1' });

        expect(comment.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ depth: MAX_COMMENT_DEPTH }),
          })
        );
      });

      it('should reject when parent depth has reached MAX_COMMENT_DEPTH', async () => {
        comment.findUnique.mockResolvedValue({
          productId: 'p1',
          depth: MAX_COMMENT_DEPTH,
          deletedAt: null,
        });

        await expect(createComment({ ...baseInput, parentId: 'parent-1' })).rejects.toThrow(
          ProductCommentErrors.MAX_DEPTH_REACHED
        );
        expect(comment.create).not.toHaveBeenCalled();
      });

      it('should reject when parent does not exist', async () => {
        comment.findUnique.mockResolvedValue(null);

        await expect(createComment({ ...baseInput, parentId: 'ghost' })).rejects.toThrow(
          ProductCommentErrors.PARENT_COMMENT_NOT_FOUND
        );
        expect(comment.create).not.toHaveBeenCalled();
      });

      it('should reject when parent belongs to a different product', async () => {
        comment.findUnique.mockResolvedValue({
          productId: 'OTHER-PRODUCT',
          depth: 0,
          deletedAt: null,
        });

        await expect(createComment({ ...baseInput, parentId: 'parent-1' })).rejects.toThrow(
          ProductCommentErrors.PARENT_COMMENT_NOT_FOUND
        );
        expect(comment.create).not.toHaveBeenCalled();
      });

      // رفتار فعلی: parent حذف‌شده (soft-delete) هم قبول می‌شود. نکته ۱ را ببین.
      it.todo('should reject replying to a soft-deleted parent');
    });

    describe('خطاها', () => {
      it('should throw PRODUCT_NOT_FOUND when product does not exist', async () => {
        product.findUnique.mockResolvedValue(null);

        await expect(createComment(baseInput)).rejects.toThrow(
          ProductCommentErrors.PRODUCT_NOT_FOUND
        );
        expect(comment.create).not.toHaveBeenCalled();
      });

      it('should log business errors via logger.error and rethrow', async () => {
        product.findUnique.mockResolvedValue(null);

        await expect(createComment(baseInput)).rejects.toThrow();

        expect(logger.error).toHaveBeenCalledWith(
          'createComment failed',
          expect.objectContaining({
            productSlug: 'iphone-15',
            authorId: 'user-1',
            error: ProductCommentErrors.PRODUCT_NOT_FOUND,
          })
        );
        expect(logger.info).not.toHaveBeenCalled();
      });

      it('should log and rethrow when prisma.create fails', async () => {
        product.findUnique.mockResolvedValue({ id: 'p1' });
        comment.create.mockRejectedValue(new Error('DB down'));

        await expect(createComment(baseInput)).rejects.toThrow('DB down');
        expect(logger.error).toHaveBeenCalledWith(
          'createComment failed',
          expect.objectContaining({ error: 'DB down' })
        );
      });

      it('should log "Unknown" when a non-Error is thrown', async () => {
        product.findUnique.mockRejectedValue('boom');

        await expect(createComment(baseInput)).rejects.toBe('boom');
        expect(logger.error).toHaveBeenCalledWith(
          'createComment failed',
          expect.objectContaining({ error: 'Unknown' })
        );
      });
    });
  });

  describe('updateComment', () => {
    it('should update with the given data and commentInclude', async () => {
      comment.update.mockResolvedValue({ id: 'c1' });

      await updateComment('c1', { content: 'متن جدید' });

      expect(comment.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { content: 'متن جدید' },
        include: commentInclude,
      });
    });

    it('should return the updated comment', async () => {
      const updated = { id: 'c1', status: 'APPROVED' };
      comment.update.mockResolvedValue(updated);

      expect(await updateComment('c1', { status: 'APPROVED' })).toEqual(updated);
    });

    it('should log the names of updated fields', async () => {
      comment.update.mockResolvedValue({ id: 'c1' });

      await updateComment('c1', { content: 'x', status: 'REJECTED' });

      expect(logger.info).toHaveBeenCalledWith(
        'updateComment success',
        expect.objectContaining({
          commentId: 'c1',
          updatedFields: ['content', 'status'],
        })
      );
    });

    it('should log and rethrow on error (e.g. comment not found)', async () => {
      comment.update.mockRejectedValue(new Error('Record not found'));

      await expect(updateComment('c1', { status: 'APPROVED' })).rejects.toThrow('Record not found');
      expect(logger.error).toHaveBeenCalledWith(
        'updateComment failed',
        expect.objectContaining({ commentId: 'c1', error: 'Record not found' })
      );
    });
  });

  describe('deleteComment', () => {
    it('should check for replies by parentId', async () => {
      comment.findFirst.mockResolvedValue(null);
      comment.delete.mockResolvedValue({});

      await deleteComment('c1');

      expect(comment.findFirst).toHaveBeenCalledWith({
        where: { parentId: 'c1' },
        select: { id: true },
      });
    });

    describe('کامنت با پاسخ (soft-delete)', () => {
      beforeEach(() => {
        comment.findFirst.mockResolvedValue({ id: 'reply-1' });
        comment.update.mockResolvedValue({});
      });

      it('should anonymize the comment instead of deleting it', async () => {
        await deleteComment('c1');

        expect(comment.update).toHaveBeenCalledWith({
          where: { id: 'c1' },
          data: {
            content: DELETED_COMMENT_PLACEHOLDER,
            authorId: null,
            deletedAt: expect.any(Date),
          },
        });
        expect(comment.delete).not.toHaveBeenCalled();
      });

      it('should return softDeleted: true and log it', async () => {
        expect(await deleteComment('c1')).toEqual({ success: true, softDeleted: true });
        expect(logger.info).toHaveBeenCalledWith(
          'deleteComment success (soft-delete)',
          expect.objectContaining({ commentId: 'c1' })
        );
      });
    });

    describe('کامنت بدون پاسخ (hard-delete)', () => {
      beforeEach(() => {
        comment.findFirst.mockResolvedValue(null);
        comment.delete.mockResolvedValue({});
      });

      it('should delete the row for real', async () => {
        await deleteComment('c1');

        expect(comment.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
        expect(comment.update).not.toHaveBeenCalled();
      });

      it('should return softDeleted: false and log it', async () => {
        expect(await deleteComment('c1')).toEqual({ success: true, softDeleted: false });
        expect(logger.info).toHaveBeenCalledWith(
          'deleteComment success (hard-delete)',
          expect.objectContaining({ commentId: 'c1' })
        );
      });
    });

    describe('خطاها', () => {
      it('should log and rethrow when findFirst fails', async () => {
        comment.findFirst.mockRejectedValue(new Error('find failed'));

        await expect(deleteComment('c1')).rejects.toThrow('find failed');
        expect(logger.error).toHaveBeenCalledWith(
          'deleteComment failed',
          expect.objectContaining({ commentId: 'c1', error: 'find failed' })
        );
      });

      it('should log and rethrow when soft-delete update fails', async () => {
        comment.findFirst.mockResolvedValue({ id: 'reply-1' });
        comment.update.mockRejectedValue(new Error('update failed'));

        await expect(deleteComment('c1')).rejects.toThrow('update failed');
        expect(logger.error).toHaveBeenCalledWith(
          'deleteComment failed',
          expect.objectContaining({ error: 'update failed' })
        );
      });

      it('should log and rethrow when hard-delete fails', async () => {
        comment.findFirst.mockResolvedValue(null);
        comment.delete.mockRejectedValue(new Error('delete failed'));

        await expect(deleteComment('c1')).rejects.toThrow('delete failed');
        expect(logger.error).toHaveBeenCalledWith(
          'deleteComment failed',
          expect.objectContaining({ error: 'delete failed' })
        );
      });
    });
  });
});
