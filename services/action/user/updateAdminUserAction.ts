'use server';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';

export async function updateAdminUserAction(
  userId: string,
  data: { name?: string; email?: string }
) {
  logger.info('UpdateAdminUserAction started', { userId, data });
  const headersList = await headers();

  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    logger.warn('Unauthorized update attempt');
    return { success: false, error: 'Unauthorized: لطفاً وارد شوید' };
  }
  logger.info('Checking set-role permission for admin update', {
    adminId: session.user.id,
  });
  const permissionCheck = await auth.api.userHasPermission({
    headers: headersList,
    body: {
      userId: session.user.id,
      permission: { user: ['set-role'] },
    },
  });

  if (permissionCheck.error) {
    logger.error('Permission check error', { error: permissionCheck.error });
    return { success: false, error: 'خطا در بررسی دسترسی' };
  }

  if (!permissionCheck.success) {
    logger.warn('Permission denied for admin update', {
      adminId: session.user.id,
    });
    return { success: false, error: 'Forbidden: شما اجازه ویرایش کاربران را ندارید' };
  }

  try {
    await auth.api.adminUpdateUser({
      headers: headersList,
      body: { userId, data },
    });

    logger.info('Admin updated user successfully', {
      adminId: session.user.id,
      targetUserId: userId,
      updatedFields: Object.keys(data),
    });
    return { success: true, error: null };
  } catch (err) {
    if (err instanceof APIError) {
      logger.error('BetterAuth adminUpdateUser error', {
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
      if (err.status === 400) {
        return { success: false, error: 'اطلاعات ارسالی نامعتبر است (مثلاً ایمیل تکراری)' };
      }
      return { success: false, error: err.message };
    }

    logger.error('Unknown adminUpdateUser error', { error: err });
    return { success: false, error: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید' };
  }
}
