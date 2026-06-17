'use server';

import { auth } from '@/lib/auth';
import { LoginSchema } from '@/lib/validation/auth';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

export async function loginAction(values: unknown) {
  logger.info('LoginAction started');

  let parsed;
  try {
    parsed = LoginSchema.parse(values);
  } catch (err) {
    logger.warn('Login validation failed', { error: err });
    return { success: false, error: 'اطلاعات وارد شده معتبر نیست' };
  }

  const headersList = await headers();

  try {
    const res = await auth.api.signInEmail({
      headers: headersList,
      body: {
        email: parsed.email,
        password: parsed.password,
      },
    });

    logger.info('User logged in successfully', { email: parsed.email });

    return { success: true, data: res };
  } catch (err) {
    if (err instanceof APIError) {
      logger.error('BetterAuth login error', {
        status: err.status,
        message: err.message,
        email: parsed.email,
      });

      if (err.status === 400) {
        return { success: false, error: 'ایمیل یا رمز عبور اشتباه است' };
      }

      return { success: false, error: err.message };
    }

    logger.error('Unknown login error', { error: err });

    return { success: false, error: 'خطای داخلی سرور' };
  }
}
