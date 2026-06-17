'use server';

import { auth } from '@/lib/auth';
import { RegisterSchema } from '@/lib/validation/auth';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

export async function registerAction(values: unknown) {
  logger.info('RegisterAction started');

  let parsed;
  try {
    parsed = RegisterSchema.parse(values);
  } catch (err) {
    logger.warn('Register validation failed', { error: err });
    return { success: false, error: 'اطلاعات وارد شده معتبر نیست' };
  }

  const headersList = await headers();

  try {
    const res = await auth.api.signUpEmail({
      headers: headersList,
      body: {
        email: parsed.email,
        password: parsed.password,
        name: parsed.name,
        phone: parsed.phone,
      },
    });

    logger.info('User registered successfully', { email: parsed.email });

    return { success: true, data: res };
  } catch (err) {
    if (err instanceof APIError) {
      logger.error('BetterAuth register error', {
        status: err.status,
        message: err.message,
        email: parsed.email,
      });

      if (err.status === 400) {
        return { success: false, error: 'ایمیل تکراری یا اطلاعات نامعتبر است' };
      }

      return { success: false, error: err.message };
    }

    logger.error('Unknown register error', { error: err });

    return { success: false, error: 'خطای داخلی سرور' };
  }
}
