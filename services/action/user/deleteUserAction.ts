'use server';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { APIError } from 'better-auth/api';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function deleteUserAction(userId: string) {
  logger.info('DeleteUserAction started', { userId });

  if (!userId || typeof userId !== 'string') {
    logger.warn('Invalid userId provided', { userId });
    return { success: false, error: 'شناسه کاربر معتبر نیست' };
  }
  const headersList = await headers();

  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    logger.warn('Unauthorized delete attempt');
    return { success: false, error: 'Unauthorized: لطفاً وارد شوید' };
  }

  if (!session) throw new Error('Unauthorized');

  // ❌ جلوگیری از حذف خود کاربر
  if (session.user.id === userId) {
    logger.warn('User attempted to delete themselves', { userId });
    return { success: false, error: 'Forbidden: نمی‌توانید خودتان را حذف کنید' };
  }
  logger.info('Checking delete permission', { adminId: session.user.id });
  // 🔥 چک کردن دسترسی واقعی با Access Control
  const permissionCheck = await auth.api.userHasPermission({
    headers: headersList,
    body: {
      userId: session.user.id,
      permissions: { user: ['delete'] },
    },
  });

  if (permissionCheck.error) {
    logger.error('Permission check error', { error: permissionCheck.error });
    return { success: false, error: 'خطا در بررسی دسترسی' };
  }

  if (!permissionCheck.success) {
    logger.warn('User lacks delete permission', { adminId: session.user.id });
    return { success: false, error: 'Forbidden: شما اجازه حذف کاربر را ندارید' };
  }
  try {
    await auth.api.removeUser({
      headers: headersList,
      body: { userId },
    });
    logger.info('User deleted successfully', {
      deletedUserId: userId,
      adminId: session.user.id,
    });
    revalidatePath('/dashboard/admin');
    return { success: true, error: null };
  } catch (err) {
    if (err instanceof APIError) {
      logger.error('BetterAuth deleteUser error', {
        status: err.status,
        message: err.message,
      });
      // مدیریت خطاهای خاص Better Auth
      if (err.status === 404) {
        return { success: false, error: 'کاربر مورد نظر یافت نشد' };
      }
      return { success: false, error: err.message };
    }

    logger.error('Unknown deleteUser error', { error: err });
    return { success: false, error: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید' };
  }
}
