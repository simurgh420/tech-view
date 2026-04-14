'use server';

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';

export async function resetPasswordAction({
  newPassword,
  token,
}: {
  newPassword: string;
  token: string;
}) {
  try {
    await auth.api.resetPassword({
      headers: await headers(),
      body: {
        newPassword,
        token,
      },
    });
    return { success: true, error: null };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }

    return { success: false, error: 'خطای داخلی سرور' };
  }
}
