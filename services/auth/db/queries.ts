// services/auth/db/queries.ts

import prisma from '@/services/db/client';

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}
export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
