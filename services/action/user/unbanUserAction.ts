'use server';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { APIError } from 'better-auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function unbanUserAction(userId: string) {
  logger.info('UnbanUserAction started', { userId });
  const headersList = await headers();

  // 2. گرفتن سشن
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    logger.warn('Unauthorized unban attempt');
    return { success: false, error: 'Unauthorized: لطفاً وارد شوید' };
  }
  // . جلوگیری از آنبان کردن خود کاربر
  if (session.user.id === userId) {
    logger.warn('User attempted to unban themselves', {
      adminId: session.user.id,
    });
    return { success: false, error: 'Forbidden: نمی‌توانید خودتان را آنبان کنید' };
  }
  logger.info('Checking unban permission', { adminId: session.user.id });
  const permissionCheck = await auth.api.userHasPermission({
    headers: headersList,
    body: {
      userId: session.user.id,
      permission: { user: ['ban'] },
    },
  });

  if (permissionCheck.error) {
    logger.error('Permission check error', { error: permissionCheck.error });
    return { success: false, error: 'خطا در بررسی دسترسی' };
  }

  if (!permissionCheck.success) {
    logger.warn('Permission denied for unban', { adminId: session.user.id });
    return { success: false, error: 'Forbidden: شما اجازه آنبان کردن کاربران را ندارید' };
  }

  try {
    await auth.api.unbanUser({
      headers: headersList,
      body: { userId },
    });
    logger.info('User unbanned successfully', {
      adminId: session.user.id,
      targetUserId: userId,
    });
    revalidatePath('/dashboard/admin');

    return { success: true, error: null };
  } catch (err) {
    if (err instanceof APIError) {
      logger.error('BetterAuth unbanUser error', {
        status: err.status,
        message: err.message,
      });
      // مدیریت خطاهای خاص Better Auth
      if (err.status === 404) {
        return { success: false, error: 'کاربر مورد نظر یافت نشد' };
      }
      if (err.status === 403) {
        return { success: false, error: 'شما مجوز این کار را ندارید' };
      }
      return { success: false, error: err.message };
    }
    logger.error('Unknown unbanUser error', { error: err });
    return { success: false, error: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید' };
  }
}
