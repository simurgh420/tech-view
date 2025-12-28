// services/users/db/queries.ts

import prisma from '@/services/db/client';

// 📌 گرفتن همه کاربران (برای پنل ادمین)

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      reviews: true,
    },
  });
}

// 📌 گرفتن یک کاربر با id

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      reviews: true,
    },
  });
}
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { reviews: true },
  });
}
