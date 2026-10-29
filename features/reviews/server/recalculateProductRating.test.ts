// features/reviews/server/recalculateProductRating.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Prisma فقط به‌عنوان تایپ استفاده شده؛ برای جلوگیری از لود کلاینت واقعی mock می‌شود
vi.mock('@/app/generated/prisma/client', () => ({ Prisma: {} }));

import { recalculateProductRating } from './recalculateProductRating';

const createTx = () => ({
  review: { aggregate: vi.fn() },
  product: { update: vi.fn() },
});

type Tx = ReturnType<typeof createTx>;

const run = (tx: Tx, productId = 'p1') => recalculateProductRating(tx as any, productId);

describe('reviews/server/recalculateProductRating', () => {
  let tx: Tx;

  beforeEach(() => {
    vi.clearAllMocks();
    tx = createTx();
    tx.product.update.mockResolvedValue({});
  });

  describe('aggregate', () => {
    it('should aggregate reviews of the given product only', async () => {
      tx.review.aggregate.mockResolvedValue({ _avg: { rating: 4 }, _count: { rating: 2 } });

      await run(tx, 'p42');

      expect(tx.review.aggregate).toHaveBeenCalledTimes(1);
      expect(tx.review.aggregate).toHaveBeenCalledWith({
        where: { productId: 'p42' },
        _avg: { rating: true },
        _count: { rating: true },
      });
    });
  });

  describe('update محصول', () => {
    it('should write the average and count to the product', async () => {
      tx.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: { rating: 10 } });

      await run(tx, 'p1');

      expect(tx.product.update).toHaveBeenCalledTimes(1);
      expect(tx.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { rating: 4.5, reviewCount: 10 },
      });
    });

    it('should set rating to null and count to 0 when there are no reviews', async () => {
      tx.review.aggregate.mockResolvedValue({ _avg: { rating: null }, _count: { rating: 0 } });

      await run(tx);

      expect(tx.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { rating: null, reviewCount: 0 },
      });
    });

    it('should keep an average of 0 as 0 (not null)', async () => {
      tx.review.aggregate.mockResolvedValue({ _avg: { rating: 0 }, _count: { rating: 3 } });

      await run(tx);

      expect(tx.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { rating: 0, reviewCount: 3 },
      });
    });

    it('should not round the average', async () => {
      tx.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.333333 },
        _count: { rating: 3 },
      });

      await run(tx);

      expect(tx.product.update.mock.calls[0][0].data.rating).toBe(4.333333);
    });

    it('should update the same product it aggregated', async () => {
      tx.review.aggregate.mockResolvedValue({ _avg: { rating: 5 }, _count: { rating: 1 } });

      await run(tx, 'same-id');

      expect(tx.review.aggregate.mock.calls[0][0].where.productId).toBe('same-id');
      expect(tx.product.update.mock.calls[0][0].where.id).toBe('same-id');
    });
  });

  describe('ترتیب و خطا', () => {
    it('should aggregate before updating', async () => {
      const order: string[] = [];
      tx.review.aggregate.mockImplementation(async () => {
        order.push('aggregate');
        return { _avg: { rating: 4 }, _count: { rating: 1 } };
      });
      tx.product.update.mockImplementation(async () => {
        order.push('update');
        return {};
      });

      await run(tx);

      expect(order).toEqual(['aggregate', 'update']);
    });

    it('should propagate aggregate errors and NOT update the product', async () => {
      tx.review.aggregate.mockRejectedValue(new Error('aggregate failed'));

      await expect(run(tx)).rejects.toThrow('aggregate failed');
      expect(tx.product.update).not.toHaveBeenCalled();
    });

    it('should propagate update errors (so the transaction rolls back)', async () => {
      tx.review.aggregate.mockResolvedValue({ _avg: { rating: 4 }, _count: { rating: 1 } });
      tx.product.update.mockRejectedValue(new Error('update failed'));

      await expect(run(tx)).rejects.toThrow('update failed');
    });

    it('should return undefined', async () => {
      tx.review.aggregate.mockResolvedValue({ _avg: { rating: 4 }, _count: { rating: 1 } });

      expect(await run(tx)).toBeUndefined();
    });
  });
});
