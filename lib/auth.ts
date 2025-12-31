// lib/auth.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';

import prisma from '@/services/db/client';
import { hashPassword, verifyPassword } from './auth/hash';
import { normalizeName } from './utils';
import { nextCookies } from 'better-auth/next-js';
import { UserRole } from '@/app/generated/prisma/enums';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  secret: process.env.BETTER_AUTH_SECRET!,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async user => {
          return { data: { ...user, name: user.name ? normalizeName(user.name) : undefined } };
        },
      },
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ['USER', 'ADMIN'],
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
  },
  redirects: {
    login: '/admin/dashboard',
    logout: '/',
    register: '/',
  },
  plugins: [
    nextCookies(),
    admin({
      defaultRole: UserRole.USER,
      adminRoles: [UserRole.ADMIN],
    }),
  ],
});
export type Auth = typeof auth;
