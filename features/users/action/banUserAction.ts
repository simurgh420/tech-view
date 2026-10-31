'use server';

import { APIError } from 'better-auth';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function banUserAction(userId: string, reason: string, expiresIn: number | null) {
  const headersList = await headers();

  logger.info('BanUserAction started', {
    userId,
    reason,
    expiresIn,
  });

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user?.id) {
    logger.warn('BanUserAction failed: no session');

    return {
      success: false,
      error: 'Unauthorized: لطفاً وارد شوید',
    };
  }

  // جلوگیری از بن کردن خود کاربر
  if (session.user.id === userId) {
    logger.warn('User attempted to ban themselves', {
      adminId: session.user.id,
    });

    return {
      success: false,
      error: 'Forbidden: نمی‌توانید خودتان را بن کنید',
    };
  }

  logger.info('Checking permissions for ban', {
    adminId: session.user.id,
  });

  const permissionCheck = await auth.api.userHasPermission({
    headers: headersList,
    body: {
      userId: session.user.id,
      permissions: {
        user: ['ban'],
      },
    },
  });

  if (permissionCheck.error) {
    logger.error('Permission check error', {
      error: permissionCheck.error,
    });

    return {
      success: false,
      error: 'خطا در بررسی دسترسی',
    };
  }

  if (!permissionCheck.success) {
    logger.warn('Permission denied for ban', {
      adminId: session.user.id,
    });

    return {
      success: false,
      error: 'Forbidden: شما اجازه بن کردن ندارید',
    };
  }

  try {
    await auth.api.banUser({
      headers: headersList,
      body: {
        userId,
        banReason: reason,
        banExpiresIn: expiresIn ?? 0,
      },
    });

    logger.info('User banned successfully', {
      bannedUserId: userId,
      adminId: session.user.id,
      reason,
      expiresIn,
    });

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    if (err instanceof APIError) {
      logger.error('BetterAuth ban error', {
        status: err.status,
        message: err.message,
      });

      if (err.status === 403) {
        return {
          success: false,
          error: 'شما مجوز این کار را ندارید',
        };
      }

      if (err.status === 404) {
        return {
          success: false,
          error: 'کاربر مورد نظر یافت نشد',
        };
      }

      return {
        success: false,
        error: err.message,
      };
    }

    logger.error('Unknown ban error', {
      error: err,
    });

    return {
      success: false,
      error: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید',
    };
  }
}
