// services/auth/db/queries.ts

import prisma from '@/features/prisma-adapter/client';

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}
export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
