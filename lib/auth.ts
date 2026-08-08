import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { admin, customSession } from 'better-auth/plugins';

import { normalizeName } from '@/lib/utils';
import { ac, roles } from '@/lib/permissions';
import prisma from '@/services/db/client';
import { sendEmailAction } from '@/services/action/user/sendEmailAction';
import { hashPassword, verifyPassword } from './auth/hash';
import { isValidEmailDomain } from '@/services/action/validation/isValidEmailDomain';
import { canManageUser } from './role-rank';

const ADMIN_USER_TARGET_PATHS = new Set([
  '/admin/set-role',
  '/admin/ban-user',
  '/admin/unban-user',
  '/admin/remove-user',
  '/admin/update-user',
]);

const options = {
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 60,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const link = new URL(url);
      link.searchParams.set('callbackURL', '/auth/verify');
      const result = await sendEmailAction({
        to: user.email,
        subject: 'Verify your email address',
        meta: {
          description: 'Please verify your email address to complete the registration process.',
          link: String(link),
        },
      });
      if (!result.success) {
        console.error(`Failed to send verification email to ${user.email}:`, result.error);
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: false,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const result = await sendEmailAction({
        to: user.email,
        subject: 'Reset your password',
        meta: {
          description: 'Please click the link below to reset your password.',
          link: String(url),
        },
      });
      if (!result.success) {
        console.error(`Failed to send reset password email to ${user.email}:`, result.error);
      }
    },
  },
  hooks: {
    before: createAuthMiddleware(async ctx => {
      if (ctx.path === '/sign-up/email') {
        const email = String(ctx.body.email);
        const isReal = await isValidEmailDomain(email);
        if (!isReal) {
          throw new APIError('BAD_REQUEST', {
            message: 'Invalid email domain.',
          });
        }
        const name = normalizeName(ctx.body.name);
        return {
          context: {
            ...ctx,
            body: { ...ctx.body, name },
          },
        };
      }

      if (ctx.path === '/update-user') {
        const name = normalizeName(ctx.body.name);
        return {
          context: {
            ...ctx,
            body: { ...ctx.body, name },
          },
        };
      }

      // ───────────────────────────────────────
      // Admin user-management protection
      // ───────────────────────────────────────
      if (ADMIN_USER_TARGET_PATHS.has(ctx.path)) {
        const actingUser = ctx.context.session?.user;
        const targetUserId = ctx.body?.userId as string | undefined;

        if (!actingUser || !targetUserId) return;

        // جلوگیری از عملیات روی خود
        if (targetUserId === actingUser.id) {
          throw new APIError('FORBIDDEN', {
            message: 'نمی‌توانید این عملیات را روی حساب خودتان انجام دهید.',
          });
        }

        const targetUser = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { role: true },
        });

        if (!targetUser) return;

        // بررسی توانایی مدیریت نقش فعلی کاربر هدف
        if (!canManageUser(String(actingUser.role), String(targetUser.role))) {
          throw new APIError('FORBIDDEN', {
            message: 'شما اجازه مدیریت این حساب را ندارید.',
          });
        }

        // بررسی نقش جدید در set-role
        if (ctx.path === '/admin/set-role') {
          const requestedRole = ctx.body?.role;
          if (typeof requestedRole !== 'string') {
            throw new APIError('BAD_REQUEST', {
              message: 'نقش جدید نامعتبر است.',
            });
          }
          if (!canManageUser(String(actingUser.role), requestedRole)) {
            throw new APIError('FORBIDDEN', {
              message: 'شما اجازه اختصاص این نقش را ندارید.',
            });
          }
        }

        // بررسی نقش جدید در update-user
        if (ctx.path === '/admin/update-user') {
          const data = ctx.body?.data;
          if (data && typeof data === 'object' && 'role' in data) {
            const requestedRole = data.role;
            if (typeof requestedRole !== 'string') {
              throw new APIError('BAD_REQUEST', {
                message: 'نقش جدید نامعتبر است.',
              });
            }
            if (!canManageUser(String(actingUser.role), requestedRole)) {
              throw new APIError('FORBIDDEN', {
                message: 'شما اجازه اختصاص این نقش را ندارید.',
              });
            }
          }
        }
      }
    }),
  },
  user: {
    deleteUser: { enabled: true },
    additionalFields: {
      role: {
        type: ['USER', 'ADMIN', 'SUPER_ADMIN'],
        input: false,
      },
      banReason: { type: 'string', input: false },
      banExpiresAt: { type: 'date', input: false },
      phone: {
        type: 'string',
        input: true,
        required: false,
      },
    },
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  account: {
    accountLinking: { enabled: false },
  },
  advanced: {
    database: { generateId: false },
  },
  socialProviders: {
    google: {
      clientId: String(process.env.GOOGLE_CLIENT_ID),
      clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
    },
    github: {
      clientId: String(process.env.GITHUB_CLIENT_ID),
      clientSecret: String(process.env.GITHUB_CLIENT_SECRET),
    },
  },
  plugins: [
    admin({
      defaultRole: 'USER',
      adminRoles: ['ADMIN', 'SUPER_ADMIN'],
      ac,
      roles,
    }),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      return {
        session: {
          expiresAt: session.expiresAt,
          token: session.token,
          userAgent: session.userAgent,
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          createdAt: user.createdAt,
          role: user.role,
          phone: user.phone,
        },
      };
    }, options),
    nextCookies(),
  ],
});

export type ErrorCode = keyof typeof auth.$ERROR_CODES | 'UNKNOWN';
