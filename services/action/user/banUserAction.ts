'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function banUserAction(userId: string, reason: string, expiresIn: number | null) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  const permissionCheck = await auth.api.userHasPermission({
    headers: headersList,
    body: {
      userId: session?.user.id,
      permission: {
        user: ['ban'],
      },
    },
  });

  if (permissionCheck.error) {
    return { success: false, error: 'Forbidden: شما اجازه بن کردن ندارید' };
  }
  try {
    await auth.api.banUser({
      headers: headersList,
      body: {
        userId,
        banReason: reason,
        banExpiresIn: expiresIn ?? 0,
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: 'خطا در بن کردن کاربر' };
  }
}
