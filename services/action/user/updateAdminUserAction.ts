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

  if (session.user.id === userId) {
    return { success: false, error: 'You cannot update your own admin data' };
  }

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
    return { success: false, error: 'Forbidden: شما اجازه ویرایش کاربر را ندارید' };
  }

  try {
    await auth.api.adminUpdateUser({
      headers: headersList,
      body: { userId, data },
    });

    return { success: true };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }

    return { success: false, error: 'خطای داخلی سرور' };
  }
}
