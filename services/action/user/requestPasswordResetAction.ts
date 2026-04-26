'use server';

import { auth } from '@/lib/auth';
import { validateEmail } from '@/lib/utils';
import { APIError } from 'better-auth';

import { headers } from 'next/headers';

export async function requestPasswordResetAction({
  email,
  redirectTo,
}: {
  email: string;
  redirectTo: string;
}) {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return {
      success: false,
      error: emailValidation.error, // "فرمت ایمیل معتبر نیست" یا پیام خطای مناسب
    };
  }
  const normalizedEmail = emailValidation.normalizedEmail!;

  try {
    await auth.api.requestPasswordReset({
      headers: await headers(),
      body: {
        email: normalizedEmail,
        redirectTo,
      },
    });
    return {
      success: true,
      message: 'لینک بازیابی رمز عبور ارسال شد',
    };
  } catch (err) {
    if (err instanceof APIError && err.status === 400) {
      // حتی اگه ایمیل نامعتبر باشه، پیام موفقیت می‌دیم
      console.warn('Password reset 400:', err.body); // فقط در لاگ
      return {
        success: true,
        message: 'لینک بازیابی رمز عبور ارسال شد',
      };
    }

    console.error('Password reset error:', err);
    return {
      success: false,
      error: 'مشکلی پیش آمده. لطفاً چند دقیقه دیگر تلاش کنید',
    };
  }
}
