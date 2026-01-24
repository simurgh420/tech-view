'use server';

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';

export async function unbanUserAction(userId: string) {
  const headersList = await headers();

  const session = await auth.api.getSession({ headers: headersList });
  if (!session) return { success: false, error: 'Unauthorized' };

  if (session.user.id === userId) {
    return { success: false, error: 'You cannot unban yourself' };
  }

  const permissionCheck = await auth.api.userHasPermission({
    headers: headersList,
    body: {
      userId: session.user.id,
      permissions: {
        user: ['ban'],
      },
    },
  });

  if (permissionCheck.error) {
    return { success: false, error: 'Forbidden: شما اجازه unban کردن ندارید' };
  }

  try {
    await auth.api.unbanUser({
      headers: headersList,
      body: { userId },
    });

    return { success: true };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }

    return { success: false, error: 'خطای داخلی سرور' };
  }
}
