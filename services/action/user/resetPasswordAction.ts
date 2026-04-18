'use server';

import { auth } from '@/lib/auth';
import { isValidPassword } from '@/lib/utils';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';

export async function resetPasswordAction({
  newPassword,
  token,
}: {
  newPassword: string;
  token: string;
}) {
  // 1. اعتبارسنجی رمز عبور
  const passwordCheck = isValidPassword(newPassword);
  if (!passwordCheck.valid) {
    return {
      success: false,
      error: passwordCheck.error,
    };
  }
  // 2. اعتبارسنجی توکن
  if (!token || typeof token !== 'string') {
    return {
      success: false,
      error: 'لینک بازیابی نامعتبر یا منقضی شده است',
    };
  }
  try {
    await auth.api.resetPassword({
      headers: await headers(),
      body: {
        newPassword,
        token,
      },
    });
    return {
      success: true,
      error: null,
      message: 'رمز عبور با موفقیت تغییر کرد',
    };
  }  catch (err) {
    // 5. مدیریت خطاهای Better Auth
    if (err instanceof APIError) {
      // خطای 400 معمولاً برای توکن نامعتبر یا ضعیف بودن رمز
      if (err.status === 400) {
        return {
          success: false,
          error: 'لینک بازیابی نامعتبر یا منقضی شده است. دوباره درخواست دهید.',
        };
      }
      // سایر خطاها
      return {
        success: false,
        error: 'مشکلی پیش آمده. لطفاً دوباره تلاش کنید.',
      };
    }

    // خطای ناشناخته
    console.error('Reset password error:', err);
    return {
      success: false,
      error: 'خطای داخلی سرور. لطفاً چند دقیقه دیگر تلاش کنید.',
    };
  }
}
