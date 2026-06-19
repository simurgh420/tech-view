'use server';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';

export async function banUserAction(userId: string, reason: string, expiresIn: number | null) {
  const headersList = await headers();

  // Log: شروع عملیات

  logger.info('BanUserAction started', { userId, reason, expiresIn });

  // 1. گرفتن سشن جاری
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) {
    logger.warn('BanUserAction failed: no session');
    return { success: false, error: 'Unauthorized: لطفاً وارد شوید' };
  }
  // Log: بررسی دسترسی
  logger.info('Checking permissions for ban', { adminId: session.user.id });
  const permissionCheck = await auth.api.userHasPermission({
    headers: headersList,
    body: {
      userId: session?.user.id,
      permission: { user: ['ban'] },
    },
  });

  // اگر خطایی در بررسی رخ داده باشد
  if (permissionCheck.error) {
    logger.error('Permission check error', { error: permissionCheck.error });
    return { success: false, error: 'خطا در بررسی دسترسی' };
  }

  // اگر دسترسی وجود نداشته باشد (success === false)
  if (!permissionCheck.success) {
    logger.warn('Permission denied for ban', { adminId: session.user.id });
    return { success: false, error: 'Forbidden: شما اجازه بن کردن ندارید' };
  }
  try {
    await auth.api.banUser({
      headers: headersList,
      body: {
        userId,
        banReason: reason,
        banExpiresIn: expiresIn ?? 0, // 0 = دائمی
      },
    });
    // Log: موفقیت
    logger.info('User banned successfully', {
      bannedUserId: userId,
      adminId: session.user.id,
      reason,
      expiresIn,
    });
    return { success: true };
  } catch (err) {
    // 5. مدیریت خطاهای Better Auth
    if (err instanceof APIError) {
      logger.error('BetterAuth ban error', { status: err.status, message: err.message });
      if (err.status === 403) {
        return { success: false, error: 'شما مجوز این کار را ندارید' };
      }
      if (err.status === 404) {
        return { success: false, error: 'کاربر مورد نظر یافت نشد' };
      }
      return { success: false, error: err.message };
    }
    logger.error('Unknown ban error', { error: err });
    return { success: false, error: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید' };
  }
}
