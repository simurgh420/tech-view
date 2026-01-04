'use server';

import { auth } from '@/lib/auth';
import { LoginSchema } from '@/lib/validation/auth';
import { APIError } from 'better-auth';

export async function loginAction(values: unknown) {
  const parsed = LoginSchema.parse(values);

  try {
    const res = await auth.api.signInEmail({
      body: {
        email: parsed.email,
        password: parsed.password,
      },
    });

    return { success: true, data: res };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }

    return { success: false, error: 'خطای داخلی سرور' };
  }
}
