// lib/auth.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from '@/services/db/client';
import { AppUser } from '@/types/user';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  secret: process.env.BETTER_AUTH_SECRET!,

  emailAndPassword: {
    enabled: true,
  },

  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

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

    // 🔥 اینجا role و avatar را به user اضافه می‌کنیم
    attributes: async (user: AppUser) => ({
      role: user.role,
      avatar: user.avatar,
    }),
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,
  },
  redirects: { login: '/dashboard', logout: '/', register: '/welcome' },
});
