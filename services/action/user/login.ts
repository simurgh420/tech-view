'use server';

import { auth } from '@/lib/auth';
import { LoginSchema } from '@/lib/validation/auth';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';

export async function loginAction(values: unknown) {
  const parsed = LoginSchema.parse(values);
  const headersList = await headers();

  try {
    const res = await auth.api.signInEmail({
      headers: headersList,
      body: {
        email: parsed.email,
        password: parsed.password,
      },
    });

    return { success: true, data: res };
  } catch (err) {
    if (err instanceof APIError) {
      // مدیریت خطاهای خاص مثل رمز اشتباه
      if (err.status === 400) {
        return { success: false, error: 'ایمیل یا رمز عبور اشتباه است' };
      }
      return { success: false, error: err.message };
    }
    // خطای اعتبارسنجی Zod
    if (err instanceof Error && err.name === 'ZodError') {
      return { success: false, error: 'اطلاعات وارد شده معتبر نیست' };
    }
    return { success: false, error: 'خطای داخلی سرور' };
  }
}
