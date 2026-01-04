'use server';

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';

export async function setUserRoleAction(userId: string, role: 'USER' | 'ADMIN') {
  const headersList = await headers();

  // گرفتن سشن
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) return { success: false, error: 'Unauthorized' };

  // جلوگیری از تغییر نقش خود کاربر
  if (session.user.id === userId) {
    return { success: false, error: 'You cannot change your own role' };
  }

  // 🔥 چک کردن دسترسی واقعی با Access Control
  const permissionCheck = await auth.api.userHasPermission({
    headers: headersList,
    body: {
      userId: session.user.id,
      permissions: {
        user: ['set-role'],
      },
    },
  });

  if (permissionCheck.error) {
    return { success: false, error: 'Forbidden: شما اجازه تغییر نقش را ندارید' };
  }

  try {
    await auth.api.setRole({
      headers: headersList,
      body: {
        userId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: role as any,
      },
    });

    return { success: true };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }

    return { success: false, error: 'خطای داخلی سرور' };
  }
}
