// services/contact/db/queries.ts
import prisma from '@/services/db/client';

export async function getContacts() {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getContactById(id: string) {
  return prisma.contactMessage.findUnique({
    where: { id },
  });
}
