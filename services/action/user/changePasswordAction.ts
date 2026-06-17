'use server';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { isValidPassword } from '@/lib/utils';
import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';

export async function changePasswordAction(formData: FormData) {
  // 1. گرفتن و اعتبارسنجی ورودی‌ها
  const headersList = await headers();

  logger.info('ChangePasswordAction started');

  const currentPassword = String(formData.get('currentPassword'));

  const newPassword = String(formData.get('newPassword'));
  if (!currentPassword) {
    logger.warn('Missing currentPassword');
    return { success: false, error: 'رمز عبور فعلی را وارد کنید' };
  }
  if (!newPassword) {
    logger.warn('Missing newPassword');
    return { success: false, error: 'رمز عبور جدید را وارد کنید' };
  }
  const passwordValidation = isValidPassword(newPassword);
  if (!passwordValidation.valid) {
    logger.warn('Password validation failed', { reason: passwordValidation.error });
    return { success: false, error: passwordValidation.error };
  }
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) {
    logger.warn('Unauthorized change password attempt');
    return { success: false, error: 'لطفاً وارد حساب خود شوید' };
  }
  try {
    await auth.api.changePassword({
      headers: headersList,
      body: {
        currentPassword,
        newPassword,
      },
    });
    logger.info('Password changed successfully', { userId: session.user.id });

    await auth.api.signOut({ headers: headersList });

    logger.info('User signed out after password change', { userId: session.user.id });
    return { success: true, error: null };
  } catch (err) {
    // 5. مدیریت خطاهای Better Auth
    if (err instanceof APIError) {
      logger.error('BetterAuth changePassword error', {
        status: err.status,
        message: err.message,
      });
      // خطاهای متداول changePassword
      if (err.status === 400 && err.message.includes('incorrect')) {
        return { success: false, error: 'رمز عبور فعلی اشتباه است' };
      }
      if (err.status === 400 && err.message.includes('same')) {
        return { success: false, error: 'رمز عبور جدید نباید با رمز قبلی یکسان باشد' };
      }
      if (err.status === 401) {
        return { success: false, error: 'نشست شما منقضی شده است. دوباره وارد شوید' };
      }
      // سایر خطاهای Better Auth
      return { success: false, error: 'خطا در تغییر رمز عبور' };
    }

    // خطای ناشناخته
    logger.error('Unknown changePassword error', { error: err });
    return { success: false, error: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید' };
  }
}
