import { Prisma } from '@/app/generated/prisma/client';

export const orderInclude = {
  items: true,
  address: true,
} satisfies Prisma.OrderInclude;

export const adminOrderInclude = {
  items: true,
  address: true,
  user: {
    select: { id: true, name: true, email: true, phone: true },
  },
} satisfies Prisma.OrderInclude;
