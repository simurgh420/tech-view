'use server';

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';

export async function updateAdminUserAction(
  userId: string,
  data: { name?: string; email?: string }
) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) return { success: false, error: 'Unauthorized' };
  if (session.user.role !== 'ADMIN') return { success: false, error: 'Forbidden' };

  try {
    await auth.api.adminUpdateUser({
      headers: headersList,
      body: { userId, data },
    });
    return { success: true };
  } catch (err) {
    if (err instanceof APIError) {
      return { error: err.message };
    }
    return { error: 'خطای داخلی سرور' };
  }
}
