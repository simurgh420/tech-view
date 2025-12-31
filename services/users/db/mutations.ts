// services/users/db/mutations.ts
import { Prisma } from '@/app/generated/prisma/client';
import prisma from '@/services/db/client';

import { UserRole } from '@/types/user';
type UpdateUserInput = Partial<{
  name: string;
  email: string;
  image: string | null;
  role: UserRole | string;
}>;
const isValidRole = (r: unknown): r is UserRole => r === 'ADMIN' || r === 'USER';
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
      role: true,
      createdAt: true,
    },
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const payload: Partial<Prisma.UserUpdateInput> = {};

  if (typeof data.name === 'string') payload.name = data.name;
  if (typeof data.email === 'string') payload.email = data.email;
  if (data.image === null || typeof data.image === 'string') payload.image = data.image;

  if (typeof data.role === 'string') {
    if (data.role === 'ADMIN' || data.role === 'USER') {
      // تبدیل صریح به enum
      payload.role = data.role as UserRole;
      // یا به صورت عملیات فیلد: payload.role = { set: data.role as UserRole };
    } else {
      throw new Error('Invalid role');
    }
  }

  return prisma.user.update({
    where: { id },
    data: payload,
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });
}

export async function deleteUser(id: string) {
  await prisma.user.delete({
    where: { id },
  });
  return { success: true };
}
//برای داشبورد
export async function updateUserRole(id: string, role: unknown) {
  if (!isValidRole(role)) {
    throw new Error('Invalid role');
  }
  return prisma.user.update({
    where: { id },
    data: {
      role: { set: role } as Prisma.EnumUserRoleFieldUpdateOperationsInput,
    },
    select: { id: true, role: true },
  });
}
