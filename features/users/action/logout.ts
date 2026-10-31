'use server';

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { logger } from '@/lib/logger';

export async function logoutAction() {
  logger.info('LogoutAction started');

  const headersList = await headers();

  try {
    await auth.api.signOut({ headers: headersList });

    logger.info('User signed out successfully');
  } catch (err) {
    if (err instanceof APIError) {
      logger.error('BetterAuth logout error', {
        status: err.status,
        message: err.message,
      });

      return { success: false, error: err.message };
    }

    logger.error('Unknown logout error', { error: err });

    return { success: false, error: 'خطای داخلی سرور' };
  }

  // پاک کردن کش صفحه اصلی (اختیاری)
  revalidatePath('/');

  // هدایت به صفحه ورود
  redirect('/auth/login');
}
