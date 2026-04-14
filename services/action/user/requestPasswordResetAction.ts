'use server';

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth';

import { headers } from 'next/headers';

export async function requestPasswordResetAction({
  email,
  redirectTo,
}: {
  email: string;
  redirectTo: string;
}) {
  try {
    await auth.api.requestPasswordReset({
      headers: await headers(),
      body: {
        email,
        redirectTo,
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
