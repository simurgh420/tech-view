// services/auth/db/mutations.ts
import prisma from '@/features/prisma-adapter/client';

export async function createUser(data: { name: string; email: string; password: string }) {
  return prisma.user.create({ data });
}
