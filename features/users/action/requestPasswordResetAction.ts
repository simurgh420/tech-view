'use server';

import { auth } from '@/lib/auth';
import { validateEmail } from '@/lib/utils';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

export async function requestPasswordResetAction({
  email,
  redirectTo,
}: {
  email: string;
  redirectTo: string;
}) {
  logger.info('PasswordResetAction started', { email });

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    logger.warn('Invalid email format for password reset', { email });
    return {
      success: false,
      error: emailValidation.error,
    };
  }

  const normalizedEmail = emailValidation.normalizedEmail!;
  const headersList = await headers();

  try {
    await auth.api.requestPasswordReset({
      headers: headersList,
      body: {
        email: normalizedEmail,
        redirectTo,
      },
    });

    logger.info('Password reset link sent (or intentionally masked)', {
      email: normalizedEmail,
    });

    return {
      success: true,
      message: 'لینک بازیابی رمز عبور ارسال شد',
    };
  } catch (err) {
    if (err instanceof APIError && err.status === 400) {
      // ایمیل وجود ندارد → اما پیام موفقیت می‌دهیم
      logger.warn('Password reset attempted for non-existing email', {
        email: normalizedEmail,
      });

      return {
        success: true,
        message: 'لینک بازیابی رمز عبور ارسال شد',
      };
    }

    logger.error('Unknown password reset error', { error: err });

    return {
      success: false,
      error: 'مشکلی پیش آمده. لطفاً چند دقیقه دیگر تلاش کنید',
    };
  }
}
