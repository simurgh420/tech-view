import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getContacts, getContactById } from '@/services/contact/db/queries';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => ({
  default: {
    contactMessage: {
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

describe('Contact DB Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getContacts', () => {
    const mockContacts = [
      { id: '1', name: 'John', email: 'john@example.com', createdAt: new Date() },
      { id: '2', name: 'Jane', email: 'jane@example.com', createdAt: new Date() },
    ];

    it('should return all contacts ordered by createdAt desc', async () => {
      (prisma.contactMessage.findMany as any).mockResolvedValue(mockContacts);
      const result = await getContacts();
      expect(prisma.contactMessage.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockContacts);
      expect(logger.info).toHaveBeenCalledWith(
        'getContacts success',
        expect.objectContaining({ count: 2 })
      );
    });

    it('should handle empty result', async () => {
      (prisma.contactMessage.findMany as any).mockResolvedValue([]);
      const result = await getContacts();
      expect(result).toEqual([]);
      expect(logger.info).toHaveBeenCalledWith(
        'getContacts success',
        expect.objectContaining({ count: 0 })
      );
    });

    it('should log error and throw on failure', async () => {
      const dbError = new Error('DB connection lost');
      (prisma.contactMessage.findMany as any).mockRejectedValue(dbError);
      await expect(getContacts()).rejects.toThrow('DB connection lost');
      expect(logger.error).toHaveBeenCalledWith(
        'getContacts failed',
        expect.objectContaining({ error: 'DB connection lost' })
      );
    });
  });

  describe('getContactById', () => {
    const id = 'contact-1';
    const mockContact = { id, name: 'John', email: 'john@example.com', createdAt: new Date() };

    it('should return contact when found', async () => {
      (prisma.contactMessage.findUnique as any).mockResolvedValue(mockContact);
      const result = await getContactById(id);
      expect(prisma.contactMessage.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(mockContact);
      expect(logger.info).toHaveBeenCalledWith(
        'getContactById success',
        expect.objectContaining({ id })
      );
    });

    it('should return null when not found', async () => {
      (prisma.contactMessage.findUnique as any).mockResolvedValue(null);
      const result = await getContactById('missing');
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'getContactById: not found',
        expect.objectContaining({ id: 'missing' })
      );
    });

    it('should log error and throw on failure', async () => {
      const dbError = new Error('Unique constraint error');
      (prisma.contactMessage.findUnique as any).mockRejectedValue(dbError);
      await expect(getContactById(id)).rejects.toThrow('Unique constraint error');
      expect(logger.error).toHaveBeenCalledWith(
        'getContactById failed',
        expect.objectContaining({ id, error: 'Unique constraint error' })
      );
    });
  });
});
