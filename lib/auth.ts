// lib/Auth.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from '@/services/db/client';

export const auth = betterAuth({
  // اتصال به دیتابیس از طریق Prisma Adapter
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // Secret برای امضای session/token
  secret: process.env.BETTER_AUTH_SECRET!,

  // فعال‌سازی Email + Password
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // اگر تایید ایمیل می‌خوای true کن
  },

  // فعال‌سازی Google OAuth
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // تعریف مدل User و فیلدهای مورد نیاز
  user: {
    model: 'User',
    fields: {
      email: 'email',
      emailVerified: 'emailVerified',
      name: 'name',
      image: 'image',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },

  // تنظیمات session
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 روز
  },
});
