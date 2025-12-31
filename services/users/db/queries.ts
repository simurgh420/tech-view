// services/users/db/queries.ts

import prisma from '@/services/db/client';

//گرفتن همه کاربر ها برای داشبورد
export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      reviews: true,
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
      role: true,
      createdAt: true,
      updatedAt: true,
      reviews: true,
    },
  });
}
//برای داشبورد

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      reviews: true,
    },
  });
}
