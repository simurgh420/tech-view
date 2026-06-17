'use server';

import { auth } from '@/lib/auth';
import { isValidPassword } from '@/lib/utils';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

export async function resetPasswordAction({
  newPassword,
  token,
}: {
  newPassword: string;
  token: string;
}) {
  logger.info('ResetPasswordAction started');

  // 1. اعتبارسنجی رمز عبور
  const passwordCheck = isValidPassword(newPassword);
  if (!passwordCheck.valid) {
    logger.warn('Password validation failed', { reason: passwordCheck.error });
    return {
      success: false,
      error: passwordCheck.error,
    };
  }

  // 2. اعتبارسنجی توکن
  if (!token || typeof token !== 'string') {
    logger.warn('Invalid or missing reset token');
    return {
      success: false,
      error: 'لینک بازیابی نامعتبر یا منقضی شده است',
    };
  }

  const headersList = await headers();

  try {
    await auth.api.resetPassword({
      headers: headersList,
      body: {
        newPassword,
        token,
      },
    });

    logger.info('Password reset successfully');

    return {
      success: true,
      error: null,
      message: 'رمز عبور با موفقیت تغییر کرد',
    };
  } catch (err) {
    if (err instanceof APIError) {
      logger.error('BetterAuth resetPassword error', {
        status: err.status,
        message: err.message,
      });

      if (err.status === 400) {
        return {
          success: false,
          error: 'لینک بازیابی نامعتبر یا منقضی شده است. دوباره درخواست دهید.',
        };
      }

      return {
        success: false,
        error: 'مشکلی پیش آمده. لطفاً دوباره تلاش کنید.',
      };
    }

    logger.error('Unknown resetPassword error', { error: err });

    return {
      success: false,
      error: 'خطای داخلی سرور. لطفاً چند دقیقه دیگر تلاش کنید.',
    };
  }
}
