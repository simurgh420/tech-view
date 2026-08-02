import prisma from '@/services/db/client';
import { CreateContactData } from '@/types/contact';
import { logger } from '@/lib/logger';

export async function createContact(data: CreateContactData) {
  const startTime = Date.now();
  try {
    const contact = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        userId: data.userId ?? null,
      },
    });
    logger.info('createContact success', {
      contactId: contact.id,
      name: data.name,
      userId: data.userId || 'anonymous',
      duration: Date.now() - startTime,
    });
    return contact;
  } catch (error) {
    logger.error('createContact failed', {
      name: data.name,
      email: data.email,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function deleteContact(id: string) {
  const startTime = Date.now();
  try {
    const contact = await prisma.contactMessage.findUnique({ where: { id } });
    if (!contact) {
      logger.info('deleteContact: contact not found', { id, duration: Date.now() - startTime });
      return null;
    }
    await prisma.contactMessage.delete({ where: { id } });
    logger.info('deleteContact success', { id, duration: Date.now() - startTime });
    return contact;
  } catch (error) {
    logger.error('deleteContact failed', {
      id,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
