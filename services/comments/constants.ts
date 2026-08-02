import { Prisma } from "@/app/generated/prisma/client";

export const authorSelect = {
  name: true,
  image: true,
} satisfies Prisma.UserSelect;
