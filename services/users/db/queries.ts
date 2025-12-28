// services/users/db/queries.ts

import prisma from '@/services/db/client';

// 📌 گرفتن همه کاربران (برای پنل ادمین)

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
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

// 📌 گرفتن یک کاربر با id

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
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
