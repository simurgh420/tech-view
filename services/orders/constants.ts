import { Prisma } from '@/app/generated/prisma/client';

export const orderInclude = {
  items: true,
  address: true,
} satisfies Prisma.OrderInclude;
