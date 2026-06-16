'use server';

import { auth } from '@/lib/auth';
import { RegisterSchema } from '@/lib/validation/auth';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';

export async function registerAction(values: unknown) {
  const parsed = RegisterSchema.parse(values);
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

    return { success: true, data: res };
  } catch (err) {
    if (err instanceof APIError) {
      // خطای 400 معمولاً برای ایمیل تکراری یا رمز ضعیف
      if (err.status === 400) {
        return { success: false, error: 'ایمیل تکراری یا اطلاعات نامعتبر است' };
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
