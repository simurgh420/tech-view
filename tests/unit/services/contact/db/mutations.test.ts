import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createContact, deleteContact } from '@/services/contact/db/mutations';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

vi.mock('@/services/db/client', () => ({
  default: {
    contactMessage: {
      create: vi.fn(),
      findUnique: vi.fn(),
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

describe('Contact DB Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createContact', () => {
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '09123456789',
      subject: 'Question',
      message: 'Hello, I have a question.',
      userId: 'user-1',
    };
    const mockContact = { id: 'contact-1', ...input, userId: 'user-1' };

    it('should create contact successfully with userId', async () => {
      (prisma.contactMessage.create as any).mockResolvedValue(mockContact);
      const result = await createContact(input);
      expect(prisma.contactMessage.create).toHaveBeenCalledWith({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          subject: input.subject,
          message: input.message,
          userId: input.userId,
        },
      });
      expect(result).toEqual(mockContact);
      expect(logger.info).toHaveBeenCalledWith(
        'createContact success',
        expect.objectContaining({ contactId: 'contact-1' })
      );
    });

    it('should create contact with null userId when not provided', async () => {
      const inputWithoutUser = { ...input, userId: undefined };
      const mock = { ...mockContact, userId: null };
      (prisma.contactMessage.create as any).mockResolvedValue(mock);
      await createContact(inputWithoutUser as any);
      expect(prisma.contactMessage.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: null }),
      });
    });

    it('should log error and rethrow on failure', async () => {
      const dbError = new Error('Unique constraint');
      (prisma.contactMessage.create as any).mockRejectedValue(dbError);
      await expect(createContact(input)).rejects.toThrow('Unique constraint');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteContact', () => {
    const id = 'contact-1';
    const mockContact = { id, name: 'John' };

    it('should return null if contact not found', async () => {
      (prisma.contactMessage.findUnique as any).mockResolvedValue(null);
      const result = await deleteContact(id);
      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        'deleteContact: contact not found',
        expect.objectContaining({ id })
      );
    });

    it('should delete contact and return the deleted contact', async () => {
      (prisma.contactMessage.findUnique as any).mockResolvedValue(mockContact);
      (prisma.contactMessage.delete as any).mockResolvedValue(mockContact);
      const result = await deleteContact(id);
      expect(result).toEqual(mockContact);
      expect(prisma.contactMessage.delete).toHaveBeenCalledWith({ where: { id } });
      expect(logger.info).toHaveBeenCalledWith(
        'deleteContact success',
        expect.objectContaining({ id })
      );
    });

    it('should log error on failure', async () => {
      (prisma.contactMessage.findUnique as any).mockResolvedValue(mockContact);
      (prisma.contactMessage.delete as any).mockRejectedValue(new Error('FK constraint'));
      await expect(deleteContact(id)).rejects.toThrow('FK constraint');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
