// services/users/db/mutations.ts

import prisma from '@/services/db/client';
import { UserRole } from '@/types/user';

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role?: UserRole;
}) {
  return prisma.user.create({
    data: {
      ...data,
      role: data.role || 'USER',
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
    },
  });
}
export async function updateUser(
  id: string,
  data: Partial<{ name: string; email: string; password: string; avatar: string; role: UserRole }>
) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
export async function deleteUser(id: string) {
  await prisma.user.delete({
    where: { id },
  });
  return { success: true };
}
export async function updateUserRole(id: string, role: 'ADMIN' | 'USER') {
  return prisma.user.update({ where: { id }, data: { role } });
}
