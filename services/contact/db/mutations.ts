// services/contact/db/mutations.ts

import { ContactFormValues } from '@/lib/validation/contact.';
import prisma from '@/services/db/client';

export async function createContact(data: ContactFormValues & { userId?: string | null }) {
  return prisma.contactMessage.create({
    data: {
      ...data,
      userId: data.userId ?? null,
    },
  });
}

export async function deleteContact(id: string) {
  return prisma.contactMessage.delete({
    where: { id },
  });
}
