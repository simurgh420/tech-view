// app/services/actions/user/register.ts
'use server';

import { auth } from '@/lib/auth';
import { RegisterSchema } from '@/lib/validation/auth';
import { APIError } from 'better-auth';

export async function registerAction(values: unknown) {
  const parsed = RegisterSchema.parse(values);

  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: parsed.email,
        password: parsed.password,
        name: parsed.name,
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
