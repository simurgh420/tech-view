// services/contact/db/mutations.ts

import prisma from '@/services/db/client';
import { CreateContactData } from '@/types/contact';

export async function createContact(data: CreateContactData) {
  return prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      userId: data.userId ?? null,
    },
  });
}

export async function deleteContact(id: string) {
  const contact = await prisma.contactMessage.findUnique({ where: { id } });
  if (!contact) return null;

  await prisma.contactMessage.delete({ where: { id } });
  return contact; // یا true
}
