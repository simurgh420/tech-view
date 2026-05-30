import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

export async function getContacts() {
  const startTime = Date.now();
  try {
    const contacts = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    logger.info('getContacts success', {
      count: contacts.length,
      duration: Date.now() - startTime,
    });
    return contacts;
  } catch (error) {
    logger.error('getContacts failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

export async function getContactById(id: string) {
  const startTime = Date.now();
  try {
    const contact = await prisma.contactMessage.findUnique({
      where: { id },
    });
    if (!contact) {
      logger.info('getContactById: not found', { id, duration: Date.now() - startTime });
      return null;
    }
    logger.info('getContactById success', { id, duration: Date.now() - startTime });
    return contact;
  } catch (error) {
    logger.error('getContactById failed', {
      id,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
