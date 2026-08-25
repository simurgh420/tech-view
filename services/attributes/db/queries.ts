import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

export async function getAllAttributesAdmin() {
  const startTime = Date.now();

  try {
    const attributes = await prisma.attribute.findMany({
      orderBy: {
        label: 'asc',
      },
      include: {
        options: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    logger.info('getAllAttributesAdmin success', {
      count: attributes.length,
      duration: Date.now() - startTime,
    });

    return attributes;
  } catch (error) {
    logger.error('getAllAttributesAdmin failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}
