import { Prisma } from '@/app/generated/prisma/client';

export const authorSelect = {
  id: true,
  name: true,
  image: true,
  role: true,
} satisfies Prisma.UserSelect;
