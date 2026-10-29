// features/product-comments/server/queries.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/prisma-adapter/client', () => ({
  default: {
    productComment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
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
import { MAX_COMMENT_DEPTH } from '@/lib/constants/comments';
import { getCommentsByProductSlug, getCommentById, getAllCommentsAdmin } from './queries';
import { commentInclude, commentAdminInclude } from './constants';

const comment = prisma.productComment as any;

let seq = 0;
/** یک ردیف flat شبیه خروجی prisma می‌سازد */
const createFlat = (overrides: Record<string, unknown> = {}) => {
  seq += 1;
  return {
    id: `c${seq}`,
    content: `متن ${seq}`,
    productId: 'p1',
    authorId: 'user-1',
    parentId: null,
    depth: 0,
    status: 'APPROVED',
    deletedAt: null,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    author: { id: 'user-1', name: 'علی' },
    ...overrides,
  };
};

describe('product-comments/server/queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seq = 0;
  });

  describe('getCommentsByProductSlug', () => {
    describe('query ارسالی به prisma', () => {
      it('should fetch only APPROVED comments by default, oldest first', async () => {
        comment.findMany.mockResolvedValue([]);

        await getCommentsByProductSlug('iphone-15');

        expect(comment.findMany).toHaveBeenCalledWith({
          where: { product: { slug: 'iphone-15' }, status: 'APPROVED' },
          orderBy: { createdAt: 'asc' },
          include: commentInclude,
        });
      });

      it('should NOT filter by status when includeUnapproved is true', async () => {
        comment.findMany.mockResolvedValue([]);

        await getCommentsByProductSlug('iphone-15', true);

        expect(comment.findMany).toHaveBeenCalledWith({
          where: { product: { slug: 'iphone-15' } },
          orderBy: { createdAt: 'asc' },
          include: commentInclude,
        });
      });
    });

    describe('ساخت درخت', () => {
      it('should return empty array when there are no comments', async () => {
        comment.findMany.mockResolvedValue([]);

        expect(await getCommentsByProductSlug('x')).toEqual([]);
      });

      it('should return root comments with empty replies', async () => {
        const a = createFlat();
        const b = createFlat();
        comment.findMany.mockResolvedValue([a, b]);

        const tree = await getCommentsByProductSlug('x');

        expect(tree.map(n => n.id)).toEqual([a.id, b.id]);
        expect(tree.every(n => n.replies.length === 0)).toBe(true);
      });

      it('should nest replies under their parent across multiple levels', async () => {
        const root1 = createFlat({ id: 'r1' });
        const child1 = createFlat({ id: 'c1', parentId: 'r1', depth: 1 });
        const child2 = createFlat({ id: 'c2', parentId: 'r1', depth: 1 });
        const grand = createFlat({ id: 'g1', parentId: 'c1', depth: 2 });
        const root2 = createFlat({ id: 'r2' });
        comment.findMany.mockResolvedValue([root1, child1, child2, grand, root2]);

        const tree = await getCommentsByProductSlug('x');

        expect(tree.map(n => n.id)).toEqual(['r1', 'r2']);
        expect(tree[0].replies.map(n => n.id)).toEqual(['c1', 'c2']);
        expect(tree[0].replies[0].replies.map(n => n.id)).toEqual(['g1']);
        expect(tree[0].replies[1].replies).toEqual([]);
      });

      it('should keep the DB order (createdAt asc) among siblings', async () => {
        const root = createFlat({ id: 'r1' });
        const first = createFlat({ id: 'a', parentId: 'r1', depth: 1 });
        const second = createFlat({ id: 'b', parentId: 'r1', depth: 1 });
        comment.findMany.mockResolvedValue([root, first, second]);

        const tree = await getCommentsByProductSlug('x');

        expect(tree[0].replies.map(n => n.id)).toEqual(['a', 'b']);
      });

      it('should promote an orphan reply to root when its parent is not in the list', async () => {
        // مثلاً parent هنوز APPROVED نشده و فیلتر status آن را حذف کرده
        const orphan = createFlat({ id: 'o1', parentId: 'missing-parent', depth: 1 });
        comment.findMany.mockResolvedValue([orphan]);

        const tree = await getCommentsByProductSlug('x');

        expect(tree).toHaveLength(1);
        expect(tree[0].id).toBe('o1');
      });
    });

    describe('نگاشت فیلدهای هر node', () => {
      it('should map all fields of a node', async () => {
        const item = createFlat({ id: 'r1', content: 'سلام', depth: 0 });
        comment.findMany.mockResolvedValue([item]);

        const [node] = await getCommentsByProductSlug('x');

        expect(node).toEqual({
          id: 'r1',
          content: 'سلام',
          productId: 'p1',
          authorId: 'user-1',
          parentId: null,
          depth: 0,
          status: 'APPROVED',
          isDeleted: false,
          canReply: true,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          author: item.author,
          replies: [],
        });
      });

      it('should not leak deletedAt to the output', async () => {
        comment.findMany.mockResolvedValue([createFlat()]);

        const [node] = await getCommentsByProductSlug('x');

        expect(node).not.toHaveProperty('deletedAt');
      });

      it('should mark deleted comments and hide their author', async () => {
        const deleted = createFlat({ deletedAt: new Date(), authorId: null });
        comment.findMany.mockResolvedValue([deleted]);

        const [node] = await getCommentsByProductSlug('x');

        expect(node.isDeleted).toBe(true);
        expect(node.author).toBeNull();
      });

      it('should hide the author of a deleted comment even if author data is present', async () => {
        const deleted = createFlat({
          deletedAt: new Date(),
          author: { id: 'u', name: 'نباید دیده شود' },
        });
        comment.findMany.mockResolvedValue([deleted]);

        const [node] = await getCommentsByProductSlug('x');

        expect(node.author).toBeNull();
      });

      it('should allow replying below MAX_COMMENT_DEPTH', async () => {
        comment.findMany.mockResolvedValue([createFlat({ depth: MAX_COMMENT_DEPTH - 1 })]);

        const [node] = await getCommentsByProductSlug('x');

        expect(node.canReply).toBe(true);
      });

      it('should NOT allow replying at MAX_COMMENT_DEPTH', async () => {
        comment.findMany.mockResolvedValue([createFlat({ depth: MAX_COMMENT_DEPTH })]);

        const [node] = await getCommentsByProductSlug('x');

        expect(node.canReply).toBe(false);
      });
    });

    describe('لاگ و خطا', () => {
      it('should log success with slug and flat count', async () => {
        comment.findMany.mockResolvedValue([createFlat(), createFlat()]);

        await getCommentsByProductSlug('iphone-15');

        expect(logger.info).toHaveBeenCalledWith(
          'getCommentsByProductSlug success',
          expect.objectContaining({ slug: 'iphone-15', count: 2, duration: expect.any(Number) })
        );
      });

      it('should log and rethrow on error', async () => {
        comment.findMany.mockRejectedValue(new Error('DB error'));

        await expect(getCommentsByProductSlug('iphone-15')).rejects.toThrow('DB error');
        expect(logger.error).toHaveBeenCalledWith(
          'getCommentsByProductSlug failed',
          expect.objectContaining({ slug: 'iphone-15', error: 'DB error' })
        );
      });
    });
  });

  describe('getCommentById', () => {
    it('should select only id, authorId and productId', async () => {
      comment.findUnique.mockResolvedValue({ id: 'c1' });

      await getCommentById('c1');

      expect(comment.findUnique).toHaveBeenCalledWith({
        where: { id: 'c1' },
        select: { id: true, authorId: true, productId: true },
      });
    });

    it('should return the comment when found', async () => {
      const found = { id: 'c1', authorId: 'u1', productId: 'p1' };
      comment.findUnique.mockResolvedValue(found);

      expect(await getCommentById('c1')).toEqual(found);
      expect(logger.info).toHaveBeenCalledWith(
        'getCommentById success',
        expect.objectContaining({ id: 'c1' })
      );
    });

    it('should return null when not found', async () => {
      comment.findUnique.mockResolvedValue(null);

      expect(await getCommentById('c1')).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'getCommentById: not found',
        expect.objectContaining({ id: 'c1' })
      );
    });

    it('should log and rethrow on error', async () => {
      comment.findUnique.mockRejectedValue(new Error('DB error'));

      await expect(getCommentById('c1')).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalledWith(
        'getCommentById failed',
        expect.objectContaining({ id: 'c1', error: 'DB error' })
      );
    });
  });

  describe('getAllCommentsAdmin', () => {
    it('should fetch all comments (no filters), newest first, with admin include', async () => {
      comment.findMany.mockResolvedValue([]);

      await getAllCommentsAdmin();

      expect(comment.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: commentAdminInclude,
      });
    });

    it('should return a flat list (no tree) and log count', async () => {
      const list = [{ id: 'c1' }, { id: 'c2' }];
      comment.findMany.mockResolvedValue(list);

      expect(await getAllCommentsAdmin()).toEqual(list);
      expect(logger.info).toHaveBeenCalledWith(
        'getAllCommentsAdmin success',
        expect.objectContaining({ count: 2 })
      );
    });

    it('should log and rethrow on error', async () => {
      comment.findMany.mockRejectedValue(new Error('DB error'));

      await expect(getAllCommentsAdmin()).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalledWith(
        'getAllCommentsAdmin failed',
        expect.objectContaining({ error: 'DB error' })
      );
    });
  });
});
