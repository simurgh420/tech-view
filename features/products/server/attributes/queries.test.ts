// features/products/server/attributes/queries.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/prisma-adapter/client', () => ({
  default: {
    attribute: {
      findMany: vi.fn(),
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
import { getAllAttributesAdmin } from './queries';

const attribute = prisma.attribute as any;

describe('products/server/attributes/queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllAttributesAdmin', () => {
    it('should fetch all attributes sorted by label with options sorted by order', async () => {
      attribute.findMany.mockResolvedValue([]);

      await getAllAttributesAdmin();

      expect(attribute.findMany).toHaveBeenCalledTimes(1);
      expect(attribute.findMany).toHaveBeenCalledWith({
        orderBy: { label: 'asc' },
        include: {
          options: {
            orderBy: { order: 'asc' },
          },
        },
      });
    });

    it('should not apply any where filter', async () => {
      attribute.findMany.mockResolvedValue([]);

      await getAllAttributesAdmin();

      expect(attribute.findMany.mock.calls[0][0]).not.toHaveProperty('where');
    });

    it('should return the attributes as-is', async () => {
      const attributes = [
        { id: 'a1', label: 'رم', options: [{ id: 'o1', value: '8GB', order: 0 }] },
        { id: 'a2', label: 'رنگ', options: [] },
      ];
      attribute.findMany.mockResolvedValue(attributes);

      expect(await getAllAttributesAdmin()).toEqual(attributes);
    });

    it('should return an empty array when there are no attributes', async () => {
      attribute.findMany.mockResolvedValue([]);

      expect(await getAllAttributesAdmin()).toEqual([]);
    });

    it('should log success with count and duration', async () => {
      attribute.findMany.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }]);

      await getAllAttributesAdmin();

      expect(logger.info).toHaveBeenCalledWith(
        'getAllAttributesAdmin success',
        expect.objectContaining({ count: 3, duration: expect.any(Number) })
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log and rethrow the same error when prisma fails', async () => {
      const error = new Error('DB error');
      attribute.findMany.mockRejectedValue(error);

      await expect(getAllAttributesAdmin()).rejects.toBe(error);

      expect(logger.error).toHaveBeenCalledWith(
        'getAllAttributesAdmin failed',
        expect.objectContaining({ error: 'DB error', duration: expect.any(Number) })
      );
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should log "Unknown" when a non-Error is thrown', async () => {
      attribute.findMany.mockRejectedValue('boom');

      await expect(getAllAttributesAdmin()).rejects.toBe('boom');

      expect(logger.error).toHaveBeenCalledWith(
        'getAllAttributesAdmin failed',
        expect.objectContaining({ error: 'Unknown' })
      );
    });
  });
});
